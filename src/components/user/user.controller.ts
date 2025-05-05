import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { AuthGuard } from "../authentication/auth.guard";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(AuthGuard)
    async listUsers() {
        return this.userService.listUsers();
    }

    @Get(':username')
    @UseGuards(AuthGuard)
    async getUser(@Param('username') username: string) {
        return this.userService.findUserByUsername(username); 
    }

    @Post()
    @UseGuards(AuthGuard)
    async createUser(
        @Req() req: Request,
        @Body('username') username: string,
        @Body('password') password: string,
        @Body('name') name: string,
        @Body('department') department: string,
        @Body('position') position: string
    ) {
        return this.userService.createUser(req, username, password, name, department, position);
    }

    @Put()
    @UseGuards(AuthGuard)
    async updateUser(
        @Req() req: Request,
        @Body('username') username: string,
        @Body('password') password: string,
        @Body('name') name: string,
        @Body('department') department: string,
        @Body('position') position: string
    ) {
        return this.userService.updateUser(req, username, password, name, department, position);
    }

    @Delete(':username')
    @UseGuards(AuthGuard)
    async deleteUser(
        @Req() req: Request,
        @Param('username') username: string
    ) {
        return this.userService.deleteUser(req, username);
    }
}