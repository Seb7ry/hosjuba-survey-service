import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case, CaseDocument } from './case.model';

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
}

@Injectable()
export class CaseService {
    constructor(
        @InjectModel(Case.name) private readonly caseModel: Model<CaseDocument>,
    ) { }

    async create(caseData: Partial<Case>): Promise<CaseDocument> {
        try {
            const exists = await this.caseModel.findOne({ caseNumber: caseData.caseNumber });
            if (exists) {
                throw new Error('Case number already exists');
            }

            const newCase = new this.caseModel(caseData);
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

        if (filters.reportedById) query['reportedBy._id'] = filters.reportedById;
        if (filters.technicianId) query['assignedTechnician._id'] = filters.technicianId;

        if (filters.typeCase) query.typeCase = filters.typeCase;

        if (filters.startDate || filters.endDate) {
            const start = filters.startDate ? new Date(filters.startDate) : null;
            let end = filters.endDate ? new Date(filters.endDate) : null;

            if (start) {
                start.setUTCHours(0, 0, 0, 0); 
            }

            if (end) {
                end.setUTCHours(23, 59, 59, 999);  
            } else if (start) {
                end = new Date(start);
                end.setUTCHours(23, 59, 59, 999);
            }

            if (start && end && end <= start) {
                throw new BadRequestException('End date must be after start date.');
            }

            query.reportedAt = {};
            if (start) query.reportedAt.$gte = start;  
            if (end) query.reportedAt.$lte = end;     
        }

        if (filters.minEffectiveness != null) query['effectivenessRating.value'] = { $gte: filters.minEffectiveness };
        if (filters.minSatisfaction != null) query['satisfactionRating.value'] = { $gte: filters.minSatisfaction };

        return this.caseModel.find(query).sort({ reportedAt: -1 }).exec();
    }

    async update(id: string, updateData: Partial<Case>): Promise<CaseDocument> {
        const updatedCase = await this.caseModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();

        if (!updatedCase) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }
        return updatedCase;
    }

    async delete(id: string): Promise<void> {
        const result = await this.caseModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }
    }
}