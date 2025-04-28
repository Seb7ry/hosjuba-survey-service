import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { AuthGuard } from "./auth.guard";
import { Request } from "express";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){ }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: Request){
        return this.authService.login(req, loginDto.username, loginDto.password);
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    async logout(@Body() body: { username: string }, @Req() req: Request){
        return this.authService.logout(req, body.username);
    }
}