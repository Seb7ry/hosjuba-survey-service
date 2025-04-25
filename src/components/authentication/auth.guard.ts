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
      console.log("No token provided");
      throw new UnauthorizedException("No token provided");
    }

    try {
      console.log("Token recibido:", token);

      const decoded: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      console.log("Datos decodificados:", decoded);

      const session = await this.sessionService.findSession(decoded.username);

      if (!session) {
        console.log(`No se encontró sesión para el usuario: ${decoded.username}`);
        throw new UnauthorizedException("Token is expired or not valid.");
      }

      if (new Date(session.expiredDateAt) < new Date()) {
        console.log("La sesión ha expirado.");
        throw new UnauthorizedException("Token is expired or not valid.");
      }

      request.user = decoded;
      console.log(request.user)

      return true;
    } catch (error) {
      console.error("Error al verificar el token:", error);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
