import { Injectable } from "@nestjs/common";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SessionService } from "../session/session.service";
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const decoded: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const session = await this.sessionService.findSession(decoded.username);

      if (!session) {
        throw new UnauthorizedException("Token is expired or not valid.");
      }

      if (new Date(session.expiredDateAt) < new Date()) {
        throw new UnauthorizedException("Token is expired or not valid.");
      }

      request.user = decoded;

      return true;
    } catch (error) {
      console.error("Error al verificar el token:", error);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
