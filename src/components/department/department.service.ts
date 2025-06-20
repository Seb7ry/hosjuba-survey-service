import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { Department, DepartmentDocument } from './department.model';
import { HistoryService } from '../history/history.service';
import { Model } from 'mongoose';
import { Request } from 'express';
import { SessionService } from '../session/session.service';
dotenv.config();

@Injectable()
export class DepartmentService {
    constructor(
        @InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>,
        private readonly historyService: HistoryService,
        private readonly sessionService: SessionService
    ) { }

    async listDepartment(): Promise<Department[]> {
        try {
            const departments = await this.departmentModel.find().exec();
            return departments;
        } catch (e) {
            throw new InternalServerErrorException('Error al listar las dependencias.', e.message);
        }
    }

    async createDepartment(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Se requieren todos los datos para crear la dependencia.', HttpStatus.BAD_REQUEST);

            const existingDepartment = await this.departmentModel.findOne({ name }).exec();
            if (existingDepartment) throw new HttpException('El nombre de dependencia ya existe.', HttpStatus.BAD_REQUEST);
            const departmentData: Partial<Department> = { name };

            const department = new this.departmentModel(departmentData);
            await department.save();

            await this.historyService.createHistory(
                req.user.username,
                `Creó la dependencia "${name}".`
            );

            return department;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al crear una dependencia.', e.message);
        }
    }

    async updateDepartment(req: Request, currentName: string, newName: string) {
        try {
            const department = await this.departmentModel.findOne({ name: currentName }).exec();
            if (!department) throw new HttpException('La dependencia no existe.', HttpStatus.NOT_FOUND);

            if (newName !== currentName) {
                const existingDept = await this.departmentModel.findOne({ name: newName }).exec();
                if (existingDept) throw new HttpException('Ya existe una dependencia con ese nombre.', HttpStatus.CONFLICT);
            }

            department.name = newName;
            await department.save();

            await this.historyService.createHistory(
                req.user.username,
                `Actualizó la dependencia de "${currentName}" a "${newName}".`
            );

            return department;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al actualizar la dependencia.', e.message);
        }
    }

    async deleteDepartment(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Debe proporcionar un nombre de dependencia.', HttpStatus.BAD_REQUEST);
            const department = await this.departmentModel.findOne({ name }).exec();
            if (!department) throw new HttpException('La dependencia no existe.', HttpStatus.NOT_FOUND);

            await this.departmentModel.deleteOne({ name }).exec();

            await this.historyService.createHistory(
                req.user.username,
                `Eliminó la dependencia "${name}".`
            );

            return { message: 'Dependencia eliminada correctamente.' };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al eliminar la dependencia.', e.message);
        }
    }
}