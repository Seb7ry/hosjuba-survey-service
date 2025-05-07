import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogModule } from './components/log/log.module';
import { UserModule } from './components/user/user.module';
import { AuthModule } from './components/authentication/auth.module';
import { HistoryModule } from './components/history/history.module';
import { SessionModule } from './components/session/session.module';
import { GoogleDriveModule } from './services/google-drive/google-drive.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

import { AppController } from './app.controller';
import { OneDriveModule } from './services/one-drive/one-drive.module';
import { CaseModule } from './components/case/case.module';

@Module({
  imports: [
    LogModule,
    UserModule,
    AuthModule,
    CaseModule,
    SessionModule,
    HistoryModule,
    GoogleDriveModule,
    OneDriveModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: `mongodb://${config.get('MONGO_USER')}:${config.get('MONGO_PASSWORD')}@${config.get('MONGO_HOST')}:${config.get('MONGO_PORT')}/${config.get('MONGO_DB')}?authSource=${config.get('MONGO_AUTH_SOURCE')}`,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
