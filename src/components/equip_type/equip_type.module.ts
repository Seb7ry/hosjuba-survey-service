import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { MongooseModule } from "@nestjs/mongoose";
import { EquipType, EquipTypeSchema } from "./equip_type.model";
import { JwtModule } from "@nestjs/jwt";
import { EquipTypeController } from "./equip_type.controller";
import { EquipTypeService } from "./equip_type.service";

@Module({
    imports: [
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: EquipType.name, schema: EquipTypeSchema },
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
    controllers: [EquipTypeController],
    providers: [EquipTypeService],
    exports: [EquipTypeService]
})
export class EquipTypeModule { }