import { Module } from '@nestjs/common';
import { poolPromise } from './sql.configuration';

@Module({
  imports: [],
  providers: [
    {
      provide: 'sqlServer_pool', 
      useFactory: async () => await poolPromise,
    },
  ],
  exports: ['sqlServer_pool'],
})
export class SQLServerModule {}
