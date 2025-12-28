import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
