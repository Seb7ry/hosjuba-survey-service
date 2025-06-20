import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { Position, PositionDocument } from './position.model';
import { HistoryService } from '../history/history.service';
import { Model } from 'mongoose';
import { Request } from 'express';
import { SessionService } from '../session/session.service';
dotenv.config();

@Injectable()
export class PositionService {
    constructor(
        @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
        private readonly historyService: HistoryService,
        private readonly sessionService: SessionService
    ) { }

    async listPosition(): Promise<Position[]> {
        try {
            const positions = await this.positionModel.find().exec();
            return positions;
        } catch (e) {
            throw new InternalServerErrorException('Error al listar los cargos.', e.message);
        }
    }

    async createPosition(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Se requieren todos los datos para crear el cargo.', HttpStatus.BAD_REQUEST);

            const existingPosition = await this.positionModel.findOne({ name }).exec();
            if (existingPosition) throw new HttpException('El nombre del cargo ya existe.', HttpStatus.BAD_REQUEST);

            const position = new this.positionModel({ name });
            await position.save();

            await this.historyService.createHistory(
                req.user.username,
                `Creó el cargo "${name}".`
            );

            return position;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al crear un cargo.', e.message);
        }
    }

    async updatePosition(req: Request, currentName: string, newName: string) {
        try {
            const position = await this.positionModel.findOne({ name: currentName }).exec();
            if (!position) throw new HttpException('El cargo no existe.', HttpStatus.NOT_FOUND);

            if (newName !== currentName) {
                const existingDept = await this.positionModel.findOne({ name: newName }).exec();
                if (existingDept) throw new HttpException('Ya existe un cargo con ese nombre.', HttpStatus.CONFLICT);
            }

            position.name = newName;
            await position.save();

            await this.historyService.createHistory(
                req.user.username,
                `Actualizó el cargo de "${currentName}" a "${newName}".`
            );

            return position;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al actualizar el cargo.', e.message);
        }
    }

    async deletePosition(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Debe proporcionar un nombre al cargo.', HttpStatus.BAD_REQUEST);

            const position = await this.positionModel.findOne({ name }).exec();
            if (!position) throw new HttpException('El cargo no existe.', HttpStatus.NOT_FOUND);

            await this.positionModel.deleteOne({ name }).exec();

            await this.historyService.createHistory(
                req.user.username,
                `Eliminó el cargo "${name}".`
            );

            return { message: 'Cargo eliminado correctamente.' };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al eliminar el cargo.', e.message);
        }
    }
}