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

(async function main() {
  const logger = new Logger('DatabaseSeed');

  const config = new ConfigService();
  const dbConfig = TypeOrmConfigProvider(config);

  const dataSource = new DataSource({
    ...dbConfig,
    entities: [HostEntity, ConferenceEntity, SpeakerEntity],
  } as DataSourceOptions);

  try {
    await dataSource.initialize();
    logger.log('Database connected successfully');

    const hostRepository = dataSource.getRepository(HostEntity);
    const conferenceRepository = dataSource.getRepository(ConferenceEntity);
    const speakerRepository = dataSource.getRepository(SpeakerEntity);

    // Clear existing data (delete all records respecting foreign key constraints)
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
    // Create speakers from mock data
    const speakers = await speakerRepository.save(
      mockSpeakers.map((speakerData) => speakerRepository.create(speakerData)),
    );
    logger.log(`Created ${speakers.length} speakers`);
    logger.log(`Created ${conferences.length} conferences`);
    logger.log('\nSeed data summary:');
    logger.log(`- ${await hostRepository.count()} hosts`);
    logger.log(`- ${await conferenceRepository.count()} conferences`);
    logger.log(`- ${await speakerRepository.count()} speakers`);
    logger.log(`- ${await hostRepository.count()} hosts`);
    logger.log(`- ${await conferenceRepository.count()} conferences`);
    logger.log('\nDatabase seeding completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
})();
