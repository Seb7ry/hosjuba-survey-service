import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { LogModule } from "../log/log.module";
import { HistoryModule } from "../history/history.module";

@Module({
    imports: [
        LogModule,
        HistoryModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}