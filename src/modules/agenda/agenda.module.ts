import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AgendaItemEntity } from './entities/agenda-item.entity';
import { AgendaSlotEntity } from './entities/agenda-slot.entity';
import { AgendaTrackEntity } from './entities/agenda-track.entity';
import { PlaceholderAgendaSlotEntity } from './entities/placeholder-agenda-slot.entity';
import { RegularAgendaSlotEntity } from './entities/regular-agenda-slot.entity';
import { AgendaController } from './controllers/agenda.controller';
import { AgendaService } from './services/agenda.service';
import { AgendaItemService } from './services/agenda-item.service';
import { AgendaTrackService } from './services/agenda-track.service';
import { PlaceholderAgendaSlotService } from './services/placeholder-agenda-slot.service';
import { RegularAgendaSlotService } from './services/regular-agenda-slot.service';
import { AgendaSlotService } from './services/agenda-slot.service';
import { AgendaItemRepository } from './repositories/agenda-item.repository';
import { AgendaTrackRepository } from './repositories/agenda-track.repository';
import { AgendaSlotRepository } from './repositories/agenda-slot.repository';
import { PlaceholderAgendaSlotRepository } from './repositories/placeholder-agenda-slot.repository';
import { RegularAgendaSlotRepository } from './repositories/regular-agenda-slot.repository';
import { RequestService } from '@/shared/services/request.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      AgendaItemEntity,
      AgendaSlotEntity,
      AgendaTrackEntity,
      PlaceholderAgendaSlotEntity,
      RegularAgendaSlotEntity,
    ]),
  ],
  controllers: [AgendaController],
  providers: [
    AgendaService,
    AgendaItemService,
    AgendaTrackService,
    AgendaSlotService,
    PlaceholderAgendaSlotService,
    RegularAgendaSlotService,
    AgendaItemRepository,
    AgendaTrackRepository,
    AgendaSlotRepository,
    PlaceholderAgendaSlotRepository,
    RegularAgendaSlotRepository,
    RequestService,
  ],
})
export class AgendaModule {}
