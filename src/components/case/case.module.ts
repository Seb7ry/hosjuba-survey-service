import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { MongooseModule } from "@nestjs/mongoose";
import { CaseCorrective, CaseCorrectiveSchema } from "./case.corrective.model";
import { CasePreventive, CasePreventiveSchema } from "./case.preventive.model";
import { JwtModule } from "@nestjs/jwt";
import { CaseController } from "./case.controller";
import { CaseService } from "./case.service";
import { DeletedCase, DeletedCaseSchema } from "./deleted-case.model";

@Module({
    imports: [
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: CasePreventive.name, schema: CasePreventiveSchema },
            { name: CaseCorrective.name, schema: CaseCorrectiveSchema },
            { name: DeletedCase.name, schema: DeletedCaseSchema },
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