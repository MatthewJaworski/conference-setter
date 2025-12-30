import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeakerEntity } from './entities/speaker.entity';
import { SpeakerController } from './controllers/spearker.controller';
import { SpeakerService } from './services/speaker.service';
import { SpeakerRepository } from './repositories/speaker.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SpeakerEntity])],
  controllers: [SpeakerController],
  providers: [SpeakerService, SpeakerRepository],
})
export class SpeakersModule {}
