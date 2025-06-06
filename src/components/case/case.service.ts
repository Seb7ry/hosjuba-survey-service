import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import * as dotenv from 'dotenv';
import { DeletedCase, DeletedCaseDocument } from './deleted-case.model';
import { CasePreventive, CasePreventiveDocument } from './case.preventive.model';
import { CaseCorrective, CaseCorrectiveDocument } from './case.corrective.model';
import { HistoryService } from '../history/history.service';
import { Request } from 'express';

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
    caseType?: 'Preventivo' | 'Mantenimiento';
}

const INITIAL_CASE_NUMBER = parseInt(process.env.INITIAL_CASE_NUMBER || '2000', 10);

@Injectable()
export class CaseService {
    constructor(
        @InjectModel(CasePreventive.name) private readonly preventiveModel: Model<CasePreventiveDocument>,
        @InjectModel(CaseCorrective.name) private readonly correctiveModel: Model<CaseCorrectiveDocument>,
        @InjectModel(DeletedCase.name) private readonly deletedCaseModel: Model<DeletedCaseDocument>,
        private readonly historyService: HistoryService
    ) { }

    private getModel(caseType: string): Model<CasePreventiveDocument | CaseCorrectiveDocument> {
        return caseType === 'Preventivo' ? this.preventiveModel : this.correctiveModel;
    }

    async create(req: Request, caseData: Partial<CasePreventive | CaseCorrective>): Promise<CasePreventiveDocument | CaseCorrectiveDocument> {
        try {
            const isPreventive = caseData.typeCase === 'Preventivo';

            const caseType = isPreventive ? 'Preventivo' : 'Mantenimiento';
            const model = isPreventive ? this.preventiveModel : this.correctiveModel;
            const currentYear = moment().tz('America/Bogota').year();

            const initialSeq = isPreventive
                ? (process.env.INITIAL_CASE_PREVENTIVE_NUMBER ? parseInt(process.env.INITIAL_CASE_PREVENTIVE_NUMBER) : 1)
                : (process.env.INITIAL_CASE_CORRECTIVE_NUMBER ? parseInt(process.env.INITIAL_CASE_CORRECTIVE_NUMBER) : 1);

            const lastCase = await model.findOne({
                caseNumber: new RegExp(`^${currentYear}`)
            }).sort({ caseNumber: -1 }).select('caseNumber');

            let nextNumber: number;

            if (lastCase) {
                const lastCaseNumber = parseInt(lastCase.caseNumber.toString());
                const lastCaseYear = parseInt(lastCase.caseNumber.toString().substring(0, 4));

                if (lastCaseYear === currentYear) {
                    const lastSeq = parseInt(lastCase.caseNumber.toString().substring(4));
                    nextNumber = parseInt(`${currentYear}${(lastSeq + 1).toString().padStart(4, '0')}`);
                } else {
                    nextNumber = parseInt(`${currentYear}${initialSeq.toString().padStart(4, '0')}`);
                }
            } else {
                nextNumber = parseInt(`${currentYear}${initialSeq.toString().padStart(4, '0')}`);
            }

            const exists = await model.findOne({ caseNumber: nextNumber });

            if (exists) {
                throw new Error(`El número de caso ${nextNumber} ya existe en ${caseType}`);
            }


            const newCase = new model({
                ...caseData,
                caseNumber: nextNumber,
            });

            if (isPreventive) {
                await this.historyService.createHistory(
                    `${req.user.username}`,
                    `Ha creado un caso de mantenimiento PREVENTIVO nuevo, número de caso ${newCase.caseNumber}`);

            } else {
                await this.historyService.createHistory(
                    `${req.user.username}`,
                    `Ha creado un caso de mantenimiento CORRECTIVO nuevo, número de caso ${newCase.caseNumber}`);
            }
            console.log(req.user)

            return await newCase.save();
        } catch (error) {
            throw error;
        }
    }

    async findByCaseNumber(caseNumber: string, typeCase?: 'Preventivo' | 'Mantenimiento'): Promise<CasePreventiveDocument | CaseCorrectiveDocument> {
        if (typeCase === 'Preventivo') {
            const preventiveCase = await this.preventiveModel.findOne({ caseNumber }).exec();
            if (preventiveCase) return preventiveCase;
        } else if (typeCase === 'Mantenimiento') {
            const correctiveCase = await this.correctiveModel.findOne({ caseNumber }).exec();
            if (correctiveCase) return correctiveCase;
        } else {
            const preventiveCase = await this.preventiveModel.findOne({ caseNumber }).exec();
            if (preventiveCase) return preventiveCase;

            const correctiveCase = await this.correctiveModel.findOne({ caseNumber }).exec();
            if (correctiveCase) return correctiveCase;
        }

        throw new NotFoundException(`Case with number ${caseNumber} not found`);
    }


    async search(filters: SearchFilters): Promise<(CasePreventiveDocument | CaseCorrectiveDocument)[]> {
        const query: any = {};
        const caseType = filters.caseType;

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

        if (caseType) {
            const model = caseType === 'Preventivo' ? this.preventiveModel : this.correctiveModel;
            return model.find(query).sort({ caseNumber: -1 }).lean().exec();
        } else {
            const preventiveCases = await this.preventiveModel.find(query).sort({ caseNumber: -1 }).lean().exec();
            const correctiveCases = await this.correctiveModel.find(query).sort({ caseNumber: -1 }).lean().exec();

            return [...preventiveCases, ...correctiveCases].sort((a, b) => {
                const numA = parseInt(a.caseNumber?.toString() || '0');
                const numB = parseInt(b.caseNumber?.toString() || '0');
                return numB - numA;
            });
        }
    }

    async update(req: Request, caseNumber: string, updateData: Partial<CasePreventive | CaseCorrective>): Promise<CasePreventiveDocument | CaseCorrectiveDocument> {
        const existingCase = await this.findByCaseNumber(caseNumber);
        if (!existingCase) {
            throw new NotFoundException(`Case with number ${caseNumber} not found`);
        }

        if (updateData.typeCase && updateData.typeCase !== existingCase.typeCase) {
            throw new BadRequestException('Cannot change case type. Create a new case instead.');
        }

        const model = existingCase.typeCase === 'Preventivo' ? this.preventiveModel : this.correctiveModel;

        const updatedCase = await model.findOneAndUpdate(
            { caseNumber },
            updateData,
            { new: true, runValidators: true }
        ).exec();

        if (!updatedCase) {
            throw new NotFoundException(`Case with number ${caseNumber} not found after update attempt`);
        }

        await this.historyService.createHistory(
            req.user.username,
            `Ha actualizado el caso ${caseNumber} de mantenimiento ${existingCase.typeCase === 'Mantenimiento' ? 'CORRECTIVO' : existingCase.typeCase.toUpperCase()
            }`
        );

        return updatedCase;
    }

    async delete(
        req: Request,
        caseNumber: string,
        typeCase: 'Preventivo' | 'Mantenimiento'
    ): Promise<{ message: string; deletedCase: any }> {

        let model;

        if (typeCase === 'Preventivo') {
            model = this.preventiveModel;
        } else {
            model = this.correctiveModel;
        }

        const existingCase = await model.findOne({ caseNumber });

        if (!existingCase) {
            throw new NotFoundException(`No se encontró el caso número ${caseNumber} en ${typeCase}`);
        }

        const deletedCaseRecord = await this.deletedCaseModel.create({
            originalCase: existingCase.toObject(),
            deletedAt: new Date(),
            deletedBy: 'system',
            originalCollection: typeCase
        });

        const deletionResult = await model.deleteOne({ caseNumber });

        if (deletionResult.deletedCount === 0) {
            await this.deletedCaseModel.deleteOne({ _id: deletedCaseRecord._id });
            throw new Error('No se pudo eliminar el caso');
        }

        await this.historyService.createHistory(
            req.user.username,
            `Ha eliminado el caso ${caseNumber} de mantenimiento ${typeCase === 'Mantenimiento' ? 'CORRECTIVO' : typeCase.toUpperCase()
            }`
        );

        return {
            message: 'Caso eliminado correctamente',
            deletedCase: deletedCaseRecord
        };
    }

    async getDeletedCases(req: Request, caseNumber?: string): Promise<DeletedCaseDocument[] | DeletedCaseDocument | null> {
        if (caseNumber) {
            return this.deletedCaseModel.findOne({ 'originalCase.caseNumber': caseNumber }).lean().exec();
        }
        return this.deletedCaseModel.find().sort({ deletedAt: -1 }).lean().exec();
    }

    async restoreDeletedCase(req: Request, caseNumber: string): Promise<CasePreventiveDocument | CaseCorrectiveDocument> {
        const deleted = await this.deletedCaseModel.findOne({ 'originalCase.caseNumber': caseNumber }).lean();

        if (!deleted) {
            throw new NotFoundException(`No se encontró un caso eliminado con número ${caseNumber}`);
        }

        const model = deleted.originalCase.typeCase === 'Preventivo'
            ? this.preventiveModel
            : this.correctiveModel;

        const baseNumber = deleted.originalCase.caseNumber.toString();

        const existingCaseInSameCollection = await model.findOne({ caseNumber: baseNumber });

        let restoredNumber = baseNumber;

        if (existingCaseInSameCollection) {
            let suffix = 1;

            while (true) {
                const potentialNumber = `${baseNumber}(${suffix})`;

                const existsInSameCollection = await model.findOne({ caseNumber: potentialNumber });
                if (!existsInSameCollection) {
                    restoredNumber = potentialNumber;
                    break;
                }

                suffix++;
            }
        }

        const restoredData = {
            ...deleted.originalCase,
            caseNumber: restoredNumber,
            _id: undefined
        };

        const restoredCase = new model(restoredData);
        await restoredCase.save();
        await this.deletedCaseModel.deleteOne({ _id: deleted._id });

        await this.historyService.createHistory(
            req.user?.username || 'sistema',
            `Ha restaurado el caso ${caseNumber} como ${restoredNumber} de mantenimiento ${deleted.originalCase.typeCase === 'Mantenimiento' ? 'CORRECTIVO' : 'PREVENTIVO'}`
        );

        return restoredCase;
    }

}