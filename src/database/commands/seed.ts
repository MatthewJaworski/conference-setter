import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigProvider } from '../database-config.provider';
import { Logger } from '@nestjs/common';
import { ConferenceEntity } from '@/modules/conferences/entities/conference.entity';
import { HostEntity } from '@/modules/conferences/entities/host.entity';
import { mockHosts } from '@/shared/mocks/hosts.mock';
import { mockConferences } from '@/shared/mocks/conferences.mock';
import { SpeakerEntity } from '@/modules/speakers/entities/speaker.entity';
import { mockSpeakers } from '@/shared/mocks/speakers.mock';
import { AgendaItemEntity } from '@/modules/agenda/entities/agenda-item.entity';
import { AgendaTrackEntity } from '@/modules/agenda/entities/agenda-track.entity';
import { AgendaSlotEntity } from '@/modules/agenda/entities/agenda-slot.entity';
import { PlaceholderAgendaSlotEntity } from '@/modules/agenda/entities/placeholder-agenda-slot.entity';
import { RegularAgendaSlotEntity } from '@/modules/agenda/entities/regular-agenda-slot.entity';
import { mockAgendaItems } from '@/shared/mocks/agenda-items.mock';
import {
  mockAgendaTracks,
  mockPlaceholderSlots,
  mockRegularSlots,
} from '@/shared/mocks/agenda.mock';

(async function main() {
  const logger = new Logger('DatabaseSeed');

  const config = new ConfigService();
  const dbConfig = TypeOrmConfigProvider(config);

  const dataSource = new DataSource({
    ...dbConfig,
    entities: [
      HostEntity,
      ConferenceEntity,
      SpeakerEntity,
      AgendaItemEntity,
      AgendaTrackEntity,
      AgendaSlotEntity,
      PlaceholderAgendaSlotEntity,
      RegularAgendaSlotEntity,
    ],
  } as DataSourceOptions);

  try {
    await dataSource.initialize();
    logger.log('Database connected successfully');

    const hostRepository = dataSource.getRepository(HostEntity);
    const conferenceRepository = dataSource.getRepository(ConferenceEntity);
    const speakerRepository = dataSource.getRepository(SpeakerEntity);
    const agendaItemRepository = dataSource.getRepository(AgendaItemEntity);
    const agendaTrackRepository = dataSource.getRepository(AgendaTrackEntity);
    const placeholderSlotRepository = dataSource.getRepository(PlaceholderAgendaSlotEntity);
    const regularSlotRepository = dataSource.getRepository(RegularAgendaSlotEntity);

    // Clear existing data (delete all records respecting foreign key constraints)
    await regularSlotRepository.createQueryBuilder().delete().execute();
    await placeholderSlotRepository.createQueryBuilder().delete().execute();
    await agendaTrackRepository.createQueryBuilder().delete().execute();
    await agendaItemRepository.createQueryBuilder().delete().execute();
    await conferenceRepository.createQueryBuilder().delete().execute();
    await hostRepository.createQueryBuilder().delete().execute();
    await speakerRepository.createQueryBuilder().delete().execute();
    logger.log('Cleared existing data');

    // Create hosts from mock data
    const hosts = await hostRepository.save(
      mockHosts.map((hostData) => hostRepository.create(hostData)),
    );
    logger.log(`Created ${hosts.length} hosts`);

    // Create conferences from mock data
    const conferences = await conferenceRepository.save(
      mockConferences.map((conferenceData) => {
        const { hostIndex, ...data } = conferenceData;
        return conferenceRepository.create({
          ...data,
          hostId: hosts[hostIndex].id,
        });
      }),
    );
    logger.log(`Created ${conferences.length} conferences`);

    // Create speakers from mock data
    const speakers = await speakerRepository.save(
      mockSpeakers.map((speakerData) => speakerRepository.create(speakerData)),
    );
    logger.log(`Created ${speakers.length} speakers`);

    // Create agenda items from mock data
    const agendaItems = await agendaItemRepository.save(
      mockAgendaItems.map((itemData) => {
        const { conferenceIndex, speakerIndices, ...data } = itemData;
        return agendaItemRepository.create({
          ...data,
          conferenceId: conferences[conferenceIndex].id,
          speakerIds: speakerIndices.map((idx) => speakers[idx].id),
        });
      }),
    );
    logger.log(`Created ${agendaItems.length} agenda items`);

    // Create agenda tracks from mock data
    const agendaTracks = await agendaTrackRepository.save(
      mockAgendaTracks.map((trackData) => {
        const { conferenceIndex, ...data } = trackData;
        return agendaTrackRepository.create({
          ...data,
          conferenceId: conferences[conferenceIndex].id,
        });
      }),
    );
    logger.log(`Created ${agendaTracks.length} agenda tracks`);

    // Create placeholder slots from mock data
    const placeholderSlots = await placeholderSlotRepository.save(
      mockPlaceholderSlots.map((slotData) => {
        const { trackIndex, ...data } = slotData;
        return placeholderSlotRepository.create({
          ...data,
          trackId: agendaTracks[trackIndex].id,
        });
      }),
    );
    logger.log(`Created ${placeholderSlots.length} placeholder slots`);

    // Create regular slots from mock data
    const regularSlots = await regularSlotRepository.save(
      mockRegularSlots.map((slotData) => {
        const { trackIndex, agendaItemIndex, ...data } = slotData;
        return regularSlotRepository.create({
          ...data,
          trackId: agendaTracks[trackIndex].id,
          agendaItemId: agendaItems[agendaItemIndex].id,
        });
      }),
    );
    logger.log(`Created ${regularSlots.length} regular slots`);

    logger.log('\nSeed data summary:');
    logger.log(`- ${await hostRepository.count()} hosts`);
    logger.log(`- ${await conferenceRepository.count()} conferences`);
    logger.log(`- ${await speakerRepository.count()} speakers`);
    logger.log(`- ${await agendaItemRepository.count()} agenda items`);
    logger.log(`- ${await agendaTrackRepository.count()} agenda tracks`);
    logger.log(`- ${await placeholderSlotRepository.count()} placeholder slots`);
    logger.log(`- ${await regularSlotRepository.count()} regular slots`);
    logger.log('\nDatabase seeding completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
})();
