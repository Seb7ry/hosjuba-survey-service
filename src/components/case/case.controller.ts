import { Controller, Post, Get, Put, Delete, Param, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { CaseService } from './case.service';
import { Case } from './case.model';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('case')
export class CaseController {
    constructor(private readonly caseService: CaseService) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(@Body() caseData: Partial<Case>) {
        if (!caseData.caseNumber || !caseData.serviceType || !caseData.dependency) {
            throw new BadRequestException('Case number, service type and dependency are required');
        }
        return this.caseService.create(caseData);
    }

    @Get(':caseNumber')
    @UseGuards(AuthGuard)
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
        @Query('priority') priority?: string,
        @Query('reportedByName') reportedByName?: string,
        @Query('technicianName') technicianName?: string,
        @Query('equipmentName') equipmentName?: string
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
            reportedByName,
            technicianName,
            equipmentName
        };
        return this.caseService.search(filters);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: Partial<Case>) {
        return this.caseService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(@Param('id') id: string) {
        return this.caseService.delete(id);
    }
}