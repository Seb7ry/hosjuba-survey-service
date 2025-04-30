import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':username')
    async getUser(@Param('username') username: string) {
        return this.userService.findUserByUsername(username); 
    }

    @Post()
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
    async deleteUser(
        @Req() req: Request,
        @Param('username') username: string
    ) {
        return this.userService.deleteUser(req, username);
    }
}