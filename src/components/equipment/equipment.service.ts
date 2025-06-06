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
            await equipment.save();

            await this.historyService.createHistory(
                req.user?.username,
                `Creó el equipo ${name} (${brand} ${model}), tipo ${type}, departamento ${department}` +
                (serial ? `, serial ${serial}` : '') +
                (numberInventory ? `, inventario ${numberInventory}` : '')
            );

            return equipment;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al crear el equipo.', e.message);
        }
    }

    async updateEquipment(req: Request, id: string, updateData: Partial<Equipment>) {
        try {
            const equipment = await this.equipmentModel.findById(id).exec();
            if (!equipment) {
                throw new HttpException('El equipo no existe.', HttpStatus.NOT_FOUND);
            }

            const oldValues = {
                name: equipment.name,
                brand: equipment.brand,
                model: equipment.model,
                type: equipment.type,
                department: equipment.department,
                serial: equipment.serial,
                numberInventory: equipment.numberInventory
            };

            if (updateData.name && updateData.name !== equipment.name) {
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

            for (const key in updateData) {
                if (updateData[key] !== undefined) {
                    equipment[key] = updateData[key];
                }
            }

            await equipment.save();

            const changes: string[] = [];

            if (updateData.name !== undefined && updateData.name !== oldValues.name) {
                changes.push(`nombre de "${oldValues.name}" a "${updateData.name}"`);
            }
            if (updateData.brand !== undefined && updateData.brand !== oldValues.brand) {
                changes.push(`marca de "${oldValues.brand}" a "${updateData.brand}"`);
            }
            if (updateData.model !== undefined && updateData.model !== oldValues.model) {
                changes.push(`modelo de "${oldValues.model}" a "${updateData.model}"`);
            }
            if (updateData.type !== undefined && updateData.type !== oldValues.type) {
                changes.push(`tipo de "${oldValues.type}" a "${updateData.type}"`);
            }
            if (updateData.department !== undefined && updateData.department !== oldValues.department) {
                changes.push(`departamento de "${oldValues.department}" a "${updateData.department}"`);
            }
            if (updateData.serial !== undefined && updateData.serial !== oldValues.serial) {
                changes.push(`serial de "${oldValues.serial}" a "${updateData.serial}"`);
            }
            if (updateData.numberInventory !== undefined && updateData.numberInventory !== oldValues.numberInventory) {
                changes.push(`inventario de "${oldValues.numberInventory}" a "${updateData.numberInventory}"`);
            }

            if (changes.length > 0) {
                await this.historyService.createHistory(
                    req.user?.username,
                    `Actualizó el equipo ${oldValues.name}: ${changes.join(', ')}`
                );
            }

            return equipment;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al actualizar el equipo.', e.message);
        }
    }

    async deleteEquipment(req: Request, id: string) {
        try {
            if (!id) {
                throw new HttpException('Debe proporcionar un ID de equipo.', HttpStatus.BAD_REQUEST);
            }

            const equipment = await this.equipmentModel.findById(id).exec();
            if (!equipment) {
                throw new HttpException('El equipo no existe.', HttpStatus.NOT_FOUND);
            }

            await this.historyService.createHistory(
                req.user?.username,
                `Eliminó el equipo ${equipment.name} (${equipment.brand} ${equipment.model}), ` +
                `serial: ${equipment.serial || 'N/A'}, inventario: ${equipment.numberInventory || 'N/A'}`
            );

            await this.equipmentModel.findByIdAndDelete(id).exec();
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