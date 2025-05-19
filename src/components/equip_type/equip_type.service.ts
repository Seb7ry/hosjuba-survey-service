import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { EquipType, EquipTypeDocument } from './equip_type.model';
import { HistoryService } from '../history/history.service';
import { Model } from 'mongoose';
import { Request } from 'express';
import { SessionService } from '../session/session.service';
dotenv.config();

@Injectable()
export class EquipTypeService {
    constructor(
        @InjectModel(EquipType.name) private readonly equipTypeModel: Model<EquipTypeDocument>,
        private readonly historyService: HistoryService,
        private readonly sessionService: SessionService
    ) { }

    async listEquipTypes(): Promise<EquipType[]> {
        try {
            const equipTypes = await this.equipTypeModel.find().exec();
            return equipTypes;
        } catch (e) {
            throw new InternalServerErrorException('Error al listar los tipos de equipo.', e.message);
        }
    }

    async createEquipType(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Se requiere el nombre para crear el tipo de equipo.', HttpStatus.BAD_REQUEST);

            const existingEquipType = await this.equipTypeModel.findOne({ name }).exec();
            if (existingEquipType) throw new HttpException('El nombre del tipo de equipo ya existe.', HttpStatus.BAD_REQUEST);

            const equipType = new this.equipTypeModel({ name });
            return await equipType.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al crear un tipo de equipo.', e.message);
        }
    }

    async updateEquipType(req: Request, lastName: string, newName: string) {
        try {
            const equipType = await this.equipTypeModel.findOne({ name: lastName }).exec();
            if (!equipType) throw new HttpException('El tipo de equipo no existe.', HttpStatus.NOT_FOUND);

            if (newName !== equipType.name) {
                const existingEquipType = await this.equipTypeModel.findOne({ name: newName }).exec();
                if (existingEquipType) throw new HttpException('Ya existe un tipo de equipo con ese nombre.', HttpStatus.CONFLICT);
            }

            equipType.name = newName;
            return await equipType.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al actualizar el tipo de equipo.', e.message);
        }
    }

    async deleteEquipType(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Debe proporcionar un tipo de equipo.', HttpStatus.BAD_REQUEST);

            const equipType = await this.equipTypeModel.findOne({ name }).exec();
            if (!equipType) throw new HttpException('El tipo de equipo no existe.', HttpStatus.NOT_FOUND);

            await this.equipTypeModel.deleteOne({ name }).exec();
            return { message: 'Tipo de equipo eliminado correctamente.' };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al eliminar el tipo de equipo.', e.message);
        }
    }
}