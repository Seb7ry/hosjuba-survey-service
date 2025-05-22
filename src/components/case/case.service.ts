import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case, CaseDocument } from './case.model';
import * as moment from 'moment-timezone';
import * as dotenv from 'dotenv';
import { DeletedCase, DeletedCaseDocument } from './deleted-case.model';
dotenv.config();

interface SearchFilters {
    caseNumber?: string;
    serviceType?: string;
    dependency?: string;
    reportedById?: string;
    technicianId?: string;
    status?: string;
    typeCase?: string;
    startDate?: Date;
    endDate?: Date;
    minEffectiveness?: number;
    minSatisfaction?: number;
    priority?: string;
    reportedByName?: string;
    technicianName?: string;
    equipmentName?: string;
}

const INITIAL_CASE_NUMBER = parseInt(process.env.INITIAL_CASE_NUMBER || '2000', 10);

@Injectable()
export class CaseService {

    constructor(
        @InjectModel(Case.name) private readonly caseModel: Model<CaseDocument>,
        @InjectModel(DeletedCase.name) private readonly deletedCaseModel: Model<DeletedCaseDocument>,
    ) { }

    async create(caseData: Partial<Case>): Promise<CaseDocument> {
        try {
            const currentYear = moment().tz('America/Bogota').year();

            const lastCase = await this.caseModel.findOne({
                caseNumber: new RegExp(`^${currentYear}`)
            }).sort({ caseNumber: -1 }).select('caseNumber');

            const envInitial = process.env.INITIAL_CASE_NUMBER ?
                parseInt(process.env.INITIAL_CASE_NUMBER) :
                parseInt(`${currentYear}0001`);

            let nextNumber: number;

            if (lastCase) {
                const lastCaseNumber = parseInt(lastCase.caseNumber.toString());
                const lastCaseYear = parseInt(lastCase.caseNumber.toString().substring(0, 4));

                if (lastCaseYear === currentYear) {
                    nextNumber = lastCaseNumber + 1;
                } else {
                    nextNumber = parseInt(`${currentYear}0001`);
                }

                if (envInitial > nextNumber) {
                    nextNumber = envInitial;
                }
            } else {
                nextNumber = Math.max(
                    envInitial,
                    parseInt(`${currentYear}0001`)
                );
            }

            const exists = await this.caseModel.findOne({ caseNumber: nextNumber });
            if (exists) {
                throw new Error(`Case number ${nextNumber} already exists`);
            }

            const newCase = new this.caseModel({
                ...caseData,
                caseNumber: nextNumber,
            });

            return await newCase.save();
        } catch (error) {
            throw error;
        }
    }

    async findByCaseNumber(caseNumber: string): Promise<CaseDocument> {
        const caseFound = await this.caseModel.findOne({ caseNumber }).exec();
        if (!caseFound) {
            throw new NotFoundException(`Case withd number ${caseNumber} not found`);
        }
        return caseFound;
    }

    async search(filters: SearchFilters): Promise<CaseDocument[]> {
        const query: any = {};

        if (filters.caseNumber) query.caseNumber = filters.caseNumber;
        if (filters.serviceType) query.serviceType = filters.serviceType;
        if (filters.dependency) query.dependency = filters.dependency;
        if (filters.status) query.status = filters.status;
        if (filters.typeCase) query.typeCase = filters.typeCase;
        if (filters.priority) query['serviceData.priority'] = filters.priority;
        if (filters.reportedByName) query['reportedBy.name'] = { $regex: filters.reportedByName, $options: 'i' };
        if (filters.reportedById) query['reportedBy._id'] = filters.reportedById;
        if (filters.technicianId) query['assignedTechnician._id'] = filters.technicianId;
        if (filters.technicianName) query['assignedTechnician.name'] = { $regex: filters.technicianName, $options: 'i' };

        if (filters.equipmentName) {
            query.$or = [
                { 'serviceData.name': { $regex: filters.equipmentName, $options: 'i' } },
                { 'serviceData.equipments.name': { $regex: filters.equipmentName, $options: 'i' } }
            ];
        }

        if (filters.startDate || filters.endDate) {
            const start = filters.startDate ? new Date(filters.startDate) : null;
            let end = filters.endDate ? new Date(filters.endDate) : null;

            if (start) start.setUTCHours(0, 0, 0, 0);
            if (end) {
                end.setUTCHours(23, 59, 59, 999);
            } else if (start) {
                end = new Date(start);
                end.setUTCHours(23, 59, 59, 999);
            }

            if (start && end && end <= start) {
                throw new BadRequestException('La fecha final debe ser mayor a la inicial.');
            }

            query.reportedAt = {};
            if (start) query.reportedAt.$gte = start;
            if (end) query.reportedAt.$lte = end;
        }

        if (filters.minEffectiveness != null) {
            query['effectivenessRating.value'] = { $gte: filters.minEffectiveness };
        }

        if (filters.minSatisfaction != null) {
            query['satisfactionRating.value'] = { $gte: filters.minSatisfaction };
        }

        return this.caseModel.find(query).sort({ reportedAt: -1 }).lean().exec();
    }

    async update(id: string, updateData: Partial<Case>): Promise<CaseDocument> {
        const caseSearch = await this.findByCaseNumber(id);
        const updatedCase = await this.caseModel
            .findByIdAndUpdate(caseSearch._id, updateData, { new: true })
            .exec();

        if (!updatedCase) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }
        return updatedCase;
    }

    async delete(id: string): Promise<void> {
        const result = await this.findByCaseNumber(id);
        if (!result) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }

        await this.deletedCaseModel.create({
            originalCase: result.toObject(),
            deletedAt: new Date(),
        });
        
        await this.caseModel.findByIdAndDelete(result._id);
    }
}