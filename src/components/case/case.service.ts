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

    // Crear un caso
    async createCase(createCasoDto: CreateCaseDto): Promise<Case> {
        const nuevoCaso = new this.casoModel(createCasoDto);
        return nuevoCaso.save();
    }

    // Obtener todos los casos
    async getAllCases(): Promise<Case[]> {
        return this.casoModel.find().sort({ creadoEn: -1 }).exec();
    }

    // Obtener un caso por número
    async getCase(numeroCaso: string): Promise<Case> {
        const caso = await this.casoModel.findOne({ numeroCaso }).exec();
        if (!caso) throw new NotFoundException('Caso no encontrado');
        return caso;
    }

    // Obtener casos por dependencia (y opcionalmente por número de caso)
    async getCaseByDepartment(dependencia: string, numeroCaso?: string): Promise<Case[]> {
        const filter: any = { dependencia };

        if (numeroCaso) {
            filter.numeroCaso = { $regex: numeroCaso, $options: 'i' };
        }

        return this.casoModel.find(filter).sort({ creadoEn: -1 }).exec();
    }

    // Actualizar un caso
    async updateCase(id: string, updateCasoDto: UpdateCaseDto): Promise<Case> {
        const caso = await this.casoModel.findById(id).exec();
        if (!caso) throw new NotFoundException('Caso no encontrado');

        // Si se proporcionan firmas, se actualizan
        if (updateCasoDto.firmaTecnico) {
            caso.firmaTecnico = updateCasoDto.firmaTecnico;
        }

        if (updateCasoDto.firmaUsuario) {
            caso.firmaUsuario = updateCasoDto.firmaUsuario;
        }

        // Actualizar el resto de los campos
        Object.assign(caso, updateCasoDto);

        return caso.save();
    }

    // Eliminar un caso
    async deleteCase(id: string): Promise<void> {
        const res = await this.casoModel.findByIdAndDelete(id);
        if (!res) throw new NotFoundException('Caso no encontrado');
    }
}
