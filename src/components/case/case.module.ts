import { Module } from "@nestjs/common";
import { LogModule } from "../log/log.module";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Case, CaseSchema } from "./case.model";
import { JwtModule } from "@nestjs/jwt";
import { CaseController } from "./case.controller";
import { CaseService } from "./case.service";

@Module({
    imports: [
        LogModule,
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: Case.name, schema: CaseSchema },
        ]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
        }),
    ],
    controllers: [CaseController],
    providers: [CaseService],
    exports: [CaseService]
})
export class CaseModule { }