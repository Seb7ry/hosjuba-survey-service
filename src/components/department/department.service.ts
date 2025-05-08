import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { Department, DepartmentDocument } from './department.model';
import { LogService } from '../log/log.service';
import { HistoryService } from '../history/history.service';
import { Model } from 'mongoose';
import { Request } from 'express';
dotenv.config();

@Injectable()
export class DepartmentService {
    constructor(
        @InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>,
        private readonly logService: LogService,
        private readonly historyService: HistoryService
    ) { }

    async listDepartment(): Promise<Department[]> {
        try {
            const departments = await this.departmentModel.find().exec();
            return departments;
        } catch (e) {
            await this.logService.createLog('error', 'department.service.ts', 'listDepartment', `Error al listar usuarios: ${e.message}`);
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
            return await department.save();
        } catch (e) {
            await this.logService.createLog('error', 'department.service.ts', 'createDepartment', `Error al crear dependencia: ${e.message}`);
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
            //await this.historyService.createHistory(req.body.username, `Se ha actualizado el usuario ${username}.`);
            return await department.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            await this.logService.createLog('error', 'department.service.ts', 'updateDepartment', `Error al actualizar dependencia: ${e.message}`);
            throw new InternalServerErrorException('Error al actualizar la dependencia.', e.message);
        }
    }

    async deleteDepartment(req: Request, name: string) {
        try {
            if (!name) throw new HttpException('Debe proporcionar un nombre de dependencia.', HttpStatus.BAD_REQUEST);
            const department = await this.departmentModel.findOne({ name }).exec();
            if (!department) throw new HttpException('La dependencia no existe.', HttpStatus.NOT_FOUND);

            await this.departmentModel.deleteOne({ name }).exec();

            // await this.historyService.createHistory(req.body.username, `Se eliminó la dependencia ${name}.`);

            return { message: 'Dependencia eliminada correctamente.' };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            await this.logService.createLog('error', 'department.service.ts', 'deleteDepartment', `Error al eliminar dependencia: ${e.message}`);
            throw new InternalServerErrorException('Error al eliminar la dependencia.', e.message);
        }
    }
}