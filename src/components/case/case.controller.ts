import { Controller, Post, Get, Put, Delete, Param, Body, Query, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { CaseService } from './case.service';
import { AuthGuard } from '../authentication/auth.guard';
import { CasePreventive } from './case.preventive.model';
import { CaseCorrective } from './case.corrective.model';
import { Request } from 'express';

@Controller('case')
export class CaseController {
    constructor(private readonly caseService: CaseService) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(@Req() req: Request, @Body() caseData: Partial<CasePreventive | CaseCorrective>) {
        try {
            return await this.caseService.create(caseData);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':caseNumber')
    @UseGuards(AuthGuard)
    async getCase(@Req() req: Request, @Param('caseNumber') caseNumber: string) {
        try {
            return await this.caseService.findByCaseNumber(caseNumber);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    @UseGuards(AuthGuard)
    async search(
        @Query('caseNumber') caseNumber?: string,
        @Query('serviceType') serviceType?: string,
        @Query('dependency') dependency?: string,
        @Query('reportedById') reportedById?: string,
        @Query('technicianId') technicianId?: string,
        @Query('status') status?: string,
        @Query('typeCase') typeCase?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('minEffectiveness') minEffectiveness?: number,
        @Query('minSatisfaction') minSatisfaction?: number,
        @Query('priority') priority?: string,
        @Query('reportedByName') reportedByName?: string,
        @Query('technicianName') technicianName?: string,
        @Query('equipmentName') equipmentName?: string,
        @Query('caseType') caseType?: 'Preventivo' | 'Mantenimiento'
    ) {
        try {
            const filters = {
                caseNumber,
                serviceType,
                dependency,
                reportedById,
                technicianId,
                status,
                typeCase,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                minEffectiveness,
                minSatisfaction,
                priority,
                reportedByName,
                technicianName,
                equipmentName,
                caseType
            };
            return await this.caseService.search(filters);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async update(@Param('id') id: string, @Body() updateData: Partial<CasePreventive | CaseCorrective>) {
        try {
            return await this.caseService.update(id, updateData);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(@Param('id') id: string) {
        try {
            return await this.caseService.delete(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('deleted')
    @UseGuards(AuthGuard)
    async getDeletedCases(@Query('caseNumber') caseNumber?: string) {
        try {
            return await this.caseService.getDeletedCases(caseNumber);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('restore/:caseNumber')
    @UseGuards(AuthGuard)
    async restoreDeletedCase(@Param('caseNumber') caseNumber: string) {
        try {
            return await this.caseService.restoreDeletedCase(caseNumber);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}