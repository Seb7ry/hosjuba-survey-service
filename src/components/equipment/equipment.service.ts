import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { Equipment, EquipmentDocument } from './equipment.model';
import { HistoryService } from '../history/history.service';
import { Model } from 'mongoose';
import { Request } from 'express';
import { SessionService } from '../session/session.service';
dotenv.config();

@Injectable()
export class EquipmentService {
    constructor(
        @InjectModel(Equipment.name) private readonly equipmentModel: Model<EquipmentDocument>,
        private readonly historyService: HistoryService,
        private readonly sessionService: SessionService
    ) { }

    async listEquipments(): Promise<Equipment[]> {
        try {
            const equipments = await this.equipmentModel.find().sort({ name: 1 }).lean().exec();
            return equipments;
        } catch (e) {
            throw new InternalServerErrorException('Error al listar los equipos.', e.message);
        }
    }

    async createEquipment(
        req: Request,
        name: string,
        brand: string,
        model: string,
        type: string,
        department: string,
        serial?: string,
        numberInventory?: string,
    ) {
        try {
            if (!name || !brand || !model || !type || !department) {
                throw new HttpException('Se requieren nombre, marca y modelo para crear el equipo.', HttpStatus.BAD_REQUEST);
            }

            if (!serial && !numberInventory) {
                throw new HttpException('Debe proporcionar al menos el número de serie o el número de inventario.', HttpStatus.BAD_REQUEST);
            }

            const existingEquipment = await this.equipmentModel.findOne({ name }).exec();
            if (existingEquipment) {
                throw new HttpException('Ya existe un equipo con este nombre.', HttpStatus.BAD_REQUEST);
            }

            if (serial) {
                const existingSerial = await this.equipmentModel.findOne({ serial }).exec();
                if (existingSerial) {
                    throw new HttpException('Ya existe un equipo con este número de serie.', HttpStatus.BAD_REQUEST);
                }
            }

            const equipmentData: Equipment = {
                name,
                brand,
                model,
                type,
                department,
                serial,
                numberInventory,
            };

            const equipment = new this.equipmentModel(equipmentData);
            return await equipment.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al crear el equipo.', e.message);
        }
    }

    async updateEquipment(req: Request, name: string, updateData: Partial<Equipment>) {
        try {
            const equipment = await this.equipmentModel.findOne({ name }).exec();
            if (!equipment) {
                throw new HttpException('El equipo no existe.', HttpStatus.NOT_FOUND);
            }

            if (updateData.name && updateData.name !== name) {
                const existingEquipment = await this.equipmentModel.findOne({
                    name: updateData.name
                }).exec();
                if (existingEquipment) {
                    throw new HttpException('Ya existe otro equipo con este nombre.', HttpStatus.CONFLICT);
                }
            }

            if (updateData.serial && updateData.serial !== equipment.serial) {
                const existingSerial = await this.equipmentModel.findOne({
                    serial: updateData.serial
                }).exec();
                if (existingSerial) {
                    throw new HttpException('Ya existe otro equipo con este número de serie.', HttpStatus.CONFLICT);
                }
            }

            Object.assign(equipment, updateData);
            return await equipment.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al actualizar el equipo.', e.message);
        }
    }

    async deleteEquipment(req: Request, name: string) {
        try {
            if (!name) {
                throw new HttpException('Debe proporcionar un nombre de equipo.', HttpStatus.BAD_REQUEST);
            }

            const equipment = await this.equipmentModel.findOne({ name }).exec();
            if (!equipment) {
                throw new HttpException('El equipo no existe.', HttpStatus.NOT_FOUND);
            }

            await this.equipmentModel.deleteOne({ name }).exec();
            return { message: 'Equipo eliminado correctamente.' };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al eliminar el equipo.', e.message);
        }
    }

    async getEquipmentByName(name: string): Promise<Equipment> {
        try {
            const equipment = await this.equipmentModel.findOne({ name }).exec();
            if (!equipment) {
                throw new HttpException('Equipo no encontrado', HttpStatus.NOT_FOUND);
            }
            return equipment;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al obtener el equipo', e.message);
        }
    }
}