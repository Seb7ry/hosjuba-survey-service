import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { JwtModule } from "@nestjs/jwt";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { CaseModule } from "../case/case.module";
import { CorrectiveReport } from "./formats/corrective.report";
import { PreventiveReport } from "./formats/preventive.report";


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
    controllers: [ReportController],
    providers: [
        ReportService,
        PreventiveReport,
        CorrectiveReport
    ],
    exports: [ReportService]
})
export class ReportModule {}