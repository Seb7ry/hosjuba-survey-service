import { Module } from '@nestjs/common';
import { poolPromise } from './sql.configuration';
import { LogModule } from 'src/components/log/log.module';

@Module({
  imports: [LogModule],
  providers: [
    {
      provide: 'sqlServer_pool', 
      useFactory: async () => await poolPromise,
    },
  ],
  exports: ['sqlServer_pool'],
})
export class SQLServerModule {}
