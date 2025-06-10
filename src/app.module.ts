import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './components/user/user.module';
import { AuthModule } from './components/authentication/auth.module';
import { HistoryModule } from './components/history/history.module';
import { SessionModule } from './components/session/session.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

import { AppController } from './app.controller';
import { OneDriveModule } from './services/one-drive/one-drive.module';
import { CaseModule } from './components/case/case.module';
import { DepartmentModule } from './components/department/department.module';
import { PositionModule } from './components/position/position.module';
import { EquipmentModule } from './components/equipment/equipment.module';
import { EquipTypeModule } from './components/equip_type/equip_type.module';
import { PdfModule } from './components/pdf/pdf.module';
import { ReportModule } from './components/report/report.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PdfModule,
    UserModule,
    AuthModule,
    CaseModule,
    ReportModule,
    SessionModule,
    HistoryModule,
    PositionModule,
    EquipmentModule,
    EquipTypeModule,
    DepartmentModule,
    OneDriveModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src/assets'),
      serveRoot: '/assets',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
