import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { EquipmentService } from "./equipment.service";
import { AuthGuard } from "../authentication/auth.guard";
import { Request } from "express";

@Controller('equipment')
export class EquipmentController {
    constructor(private readonly equipmentService: EquipmentService) { }

    @Get()
    @UseGuards(AuthGuard)
    async listEquipment() {
        return this.equipmentService.listEquipments();
    }

    @Post()
    @UseGuards(AuthGuard)
    async createEquipment(
        @Req() req: Request,
        @Body('name') name: string,
        @Body('brand') brand: string,
        @Body('model') model: string,
        @Body('type') type: string,
        @Body('department') department: string,
        @Body('serial') serial?: string,
        @Body('numberInventory') numberInventory?: string,
    ) {
        return this.equipmentService.createEquipment(
            req,
            name,
            brand,
            model,
            type,
            department,
            serial,
            numberInventory
        );
    }

    @Put(':name')
    @UseGuards(AuthGuard)
    async updateEquipment(
        @Req() req: Request,
        @Param('name') name: string,
        @Body() updateData: any,
    ) {
        return this.equipmentService.updateEquipment(req, name, updateData);
    }

    @Delete(':name')
    @UseGuards(AuthGuard)
    async deleteEquipment(
        @Req() req: Request,
        @Param('name') name: string,
    ) {
        return this.equipmentService.deleteEquipment(req, name);
    }
}