import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConferenceEntity } from './entities/conference.entity';
import { ConferenceController } from './controllers/conference.controller';
import { HostController } from './controllers/host.controller';
import { ConferenceService } from './services/conference.service';
import { HostService } from './services/host.service';
import { HostsRepository } from './repositories/host.repository';
import { ConferencesRepository } from './repositories/conference.repository';
import { HostEntity } from './entities/host.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConferenceEntity, HostEntity])],
  controllers: [ConferenceController, HostController],
  providers: [ConferenceService, HostService, HostsRepository, ConferencesRepository],
})
export class ConferencesModule {}
