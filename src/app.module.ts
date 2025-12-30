import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmAsyncOptions } from './database/database-config.provider';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConferencesModule } from './modules/conferences/conferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync(TypeOrmAsyncOptions),
    HealthModule,
    AuthModule,
    ConferencesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
