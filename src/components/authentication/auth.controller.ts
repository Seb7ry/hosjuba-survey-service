import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){ }

    @Post('login')
    async login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto.username, loginDto.password);
    }

    @Post('logout')
    async logout(@Body() username: string){
        return this.authService.logout(username);
    }
}