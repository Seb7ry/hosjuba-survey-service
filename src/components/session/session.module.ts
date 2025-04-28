import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, SessionSchema } from "./session.model";
import { SessionService } from "./session.service";
import { LogModule } from "../log/log.module";

@Module({
    imports: [
        LogModule,
        MongooseModule.forFeature(
            [{ name: Session.name, schema: SessionSchema }]
        )
    ],
    providers: [SessionService],
    exports: [SessionService]
})
export class SessionModule{}