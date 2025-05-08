import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
import { DepartmentService } from "./department.service";
import { AuthGuard } from "../authentication/auth.guard";
import { Request } from "express";

@Controller('department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) { }

    @Get()
    @UseGuards(AuthGuard)
    async listDepartment() {
        return this.departmentService.listDepartment();
    }

    @Post()
    @UseGuards(AuthGuard)
    async createDepartment(
        @Req() req: Request,
        @Body('name') name: string,
    ) {
        return this.departmentService.createDepartment(req, name);
    }

    @Put()
    @UseGuards(AuthGuard)
    async updateDepartment(
        @Req() req: Request,
        @Body('currentName') currentName: string,
        @Body('newName') newName: string,
    ) {
        return this.departmentService.updateDepartment(req, currentName, newName);
    }

    @Delete()
    @UseGuards(AuthGuard)
    async deleteDepartment(
        @Req() req: Request,
        @Body('name') name: string,
    ) {
        return this.departmentService.deleteDepartment(req, name);
    }
}