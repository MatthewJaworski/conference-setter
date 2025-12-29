import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { Module } from '@nestjs/common';
import { HealthAuthenticatedController } from './health-authenticated.controller';

@Module({
  imports: [HttpModule],
  controllers: [HealthController, HealthAuthenticatedController],
})
export class HealthModule {}
