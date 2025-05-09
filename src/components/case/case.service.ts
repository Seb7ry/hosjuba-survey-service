import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case, CaseDocument } from './case.model';
import { CreateCaseDto } from './create-case.dto';
import { UpdateCaseDto } from './update-case.dto';

@Injectable()
export class CaseService {
    constructor(
        @InjectModel(Case.name) private readonly casoModel: Model<CaseDocument>,
    ) { }

    async createCase(createCasoDto: CreateCaseDto): Promise<Case> {
        const nuevoCaso = new this.casoModel(createCasoDto);
        return nuevoCaso.save();
    }

    async getAllCases(): Promise<Case[]> {
        return this.casoModel.find().sort({ creadoEn: -1 }).exec();
    }

    async getCase(numeroCaso: string): Promise<Case> {
        const caso = await this.casoModel.findOne({ numeroCaso }).exec();
        if (!caso) throw new NotFoundException('Caso no encontrado');
        return caso;
    }

    async getCaseByDepartment(dependencia: string, numeroCaso?: string): Promise<Case[]> {
        const filter: any = { dependencia };

        if (numeroCaso) {
            filter.numeroCaso = { $regex: numeroCaso, $options: 'i' };
        }

        return this.casoModel.find(filter).sort({ creadoEn: -1 }).exec();
    }

    async updateCase(id: string, updateCasoDto: UpdateCaseDto): Promise<Case> {
        const caso = await this.casoModel.findByIdAndUpdate(
            id,
            { $set: updateCasoDto },
            { new: true }
        ).exec();

        if (!caso) throw new NotFoundException('Caso no encontrado');
        return caso;
    }

    async deleteCase(id: string): Promise<void> {
        const res = await this.casoModel.findByIdAndDelete(id);
        if (!res) throw new NotFoundException('Caso no encontrado');
    }
}
