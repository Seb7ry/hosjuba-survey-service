import { Module } from '@nestjs/common';
import { UserModule } from './components/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SQLServerModule } from './configurations/sql-server/sql.module';
import { GoogleDriveModule } from './services/google-drive/google-drive.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';

import { AppService } from './app.service';

@Module({
  imports: [
    UserModule,
    SQLServerModule,
    GoogleDriveModule,
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
