import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { JwtModule } from "@nestjs/jwt";
import { PdfController } from "./pdf.controller";
import { PdfService } from "./pdf.service";
import { CaseModule } from "../case/case.module";


@Module({
    imports: [
        CaseModule,
        HistoryModule,
        SessionModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
        }),    
    ],
    controllers: [PdfController],
    providers: [PdfService],
    exports: [PdfService]
})
export class PdfModule {}