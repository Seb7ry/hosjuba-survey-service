import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CaseService } from './case.service';
import { CreateCaseDto } from './create-case.dto';
import { UpdateCaseDto } from './update-case.dto';
import { Case } from './case.model';

@Controller('case')
export class CaseController {
    constructor(private readonly caseService: CaseService) { }

    @Post()
    async create(@Body() createCaseDto: CreateCaseDto): Promise<Case> {
        return this.caseService.createCase(createCaseDto);
    }

    @Get()
    async findAll(): Promise<Case[]> {
        return this.caseService.getAllCases();
    }

    @Get(':numeroCaso')
    async findOne(@Param('numeroCaso') numeroCaso: string): Promise<Case> {
        return this.caseService.getCase(numeroCaso);
    }

    @Get('department')
    async getCasesByDependencia(
        @Query('department') dependencia: string,
        @Query('numeroCaso') numeroCaso?: string,
    ): Promise<Case[]> {
        return this.caseService.getCaseByDepartment(dependencia, numeroCaso);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto): Promise<Case> {
        return this.caseService.updateCase(id, updateCaseDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.caseService.deleteCase(id);
    }
}
