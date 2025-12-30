import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmAsyncOptions } from './database/database-config.provider';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConferencesModule } from './modules/conferences/conferences.module';
import { SpeakersModule } from './modules/speakers/speakers.module';

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
    SpeakersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
