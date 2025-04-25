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
        console.log(req);
        return this.authService.login(loginDto.username, loginDto.password);
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    async logout(@Body() body: { username: string }){
        return this.authService.logout(body.username);
    }
}