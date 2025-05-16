import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Equipment, EquipmentSchema } from "./equipment.model";
import { JwtModule } from "@nestjs/jwt";
import { EquipmentService } from "./equipment.service";
import { EquipmentController } from "./equipment.controller";

@Module({
    imports: [
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: Equipment.name, schema: EquipmentSchema },
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
    controllers: [EquipmentController],
    providers: [EquipmentService],
    exports: [EquipmentService]
})
export class EquipmentModule {}