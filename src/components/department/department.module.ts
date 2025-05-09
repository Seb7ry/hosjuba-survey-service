import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Department, DepartmentSchema } from "./department.model";
import { JwtModule } from "@nestjs/jwt";
import { DepartmentController } from "./department.controller";
import { DepartmentService } from "./department.service";

@Module({
    imports: [
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: Department.name, schema: DepartmentSchema },
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
    controllers: [DepartmentController],
    providers: [DepartmentService],
    exports: [DepartmentService]
})
export class DepartmentModule {}