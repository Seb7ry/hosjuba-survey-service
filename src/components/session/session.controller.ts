import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionService } from "./session.service";
import { AuthGuard } from "../authentication/auth.guard";

@Controller('session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Post()
    @UseGuards(AuthGuard)
    async refreshToken( @Body('username') username: string){
        return this.sessionService.refreshSession(username);
    }
}