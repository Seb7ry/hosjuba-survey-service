import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
import { PositionService } from "./position.service";
import { AuthGuard } from "../authentication/auth.guard";
import { Request } from "express";

@Controller('position')
export class PositionController {
    constructor(private readonly positionService: PositionService) { }

    @Get()
    @UseGuards(AuthGuard)
    async listPosition() {
        return this.positionService.listPosition();
    }

    @Post()
    @UseGuards(AuthGuard)
    async createPosition(
        @Req() req: Request,
        @Body('name') name: string,
    ) {
        return this.positionService.createPosition(req, name);
    }

    @Put()
    @UseGuards(AuthGuard)
    async updatePosition(
        @Req() req: Request,
        @Body('currentName') currentName: string,
        @Body('newName') newName: string,
    ) {
        return this.positionService.updatePosition(req, currentName, newName);
    }

    @Delete()
    @UseGuards(AuthGuard)
    async deletePosition(
        @Req() req: Request,
        @Body('name') name: string,
    ) {
        return this.positionService.deletePosition(req, name);
    }
}