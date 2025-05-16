import { Controller, Post, Get, Put, Delete, Param, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { CaseService } from './case.service';
import { Case } from './case.model';

@Controller('case')
export class CaseController {
    constructor(private readonly caseService: CaseService) { }

    @Post()
    async create(@Body() caseData: Partial<Case>) {
        if (!caseData.caseNumber || !caseData.serviceType || !caseData.dependency) {
            throw new BadRequestException('Case number, service type and dependency are required');
        }
        return this.caseService.create(caseData);
    }

    @Get(':caseNumber')
    async getCase(@Param('caseNumber') caseNumber: string) {
        return this.caseService.findByCaseNumber(caseNumber);
    }

    @Get()
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
        @Query('priority') priority?: string, // NUEVO
        @Query('reportedByName') reportedByName?: string // NUEVO
    ) {
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
            reportedByName
        };
        return this.caseService.search(filters);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: Partial<Case>) {
        return this.caseService.update(id, updateData);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.caseService.delete(id);
    }
}