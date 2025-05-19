import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { EquipTypeService } from "./equip_type.service";
import { AuthGuard } from "../authentication/auth.guard";
import { Request } from "express";

@Controller('equip-type')
export class EquipTypeController {
    constructor(private readonly equipTypeService: EquipTypeService) { }

    @Get()
    @UseGuards(AuthGuard)
    async listEquipTypes() {
        return this.equipTypeService.listEquipTypes();
    }

    @Post()
    @UseGuards(AuthGuard)
    async createEquipType(
        @Req() req: Request,
        @Body('name') name: string,
    ) {
        return this.equipTypeService.createEquipType(req, name);
    }

    @Put(':lastName')
    async updateEquipType(
        @Req() req: Request,
        @Param('lastName') lastName: string,
        @Body('newName') newName: string,
    ) {
        return this.equipTypeService.updateEquipType(req, lastName, newName);
    }

    @Delete(':name')
    @UseGuards(AuthGuard)
    async deleteEquipType(
        @Req() req: Request,
        @Param('name') name: string,
    ) {
        return this.equipTypeService.deleteEquipType(req, name);
    }
}