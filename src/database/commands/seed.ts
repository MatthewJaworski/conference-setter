import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigProvider } from '../database-config.provider';
import { Logger } from '@nestjs/common';
import { ConferenceEntity } from '@/modules/conferences/entities/conference.entity';
import { HostEntity } from '@/modules/conferences/entities/host.entity';
import { mockHosts } from '@/shared/mocks/hosts.mock';
import { mockConferences } from '@/shared/mocks/conferences.mock';

(async function main() {
  const logger = new Logger('DatabaseSeed');

  const config = new ConfigService();
  const dbConfig = TypeOrmConfigProvider(config);

  const dataSource = new DataSource({
    ...dbConfig,
    entities: [HostEntity, ConferenceEntity],
  } as DataSourceOptions);

  try {
    await dataSource.initialize();
    logger.log('Database connected successfully');

    const hostRepository = dataSource.getRepository(HostEntity);
    const conferenceRepository = dataSource.getRepository(ConferenceEntity);

    // Clear existing data (delete all records respecting foreign key constraints)
    await conferenceRepository.createQueryBuilder().delete().execute();
    await hostRepository.createQueryBuilder().delete().execute();
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

    logger.log('\nSeed data summary:');
    logger.log(`- ${await hostRepository.count()} hosts`);
    logger.log(`- ${await conferenceRepository.count()} conferences`);
    logger.log('\nDatabase seeding completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
})();
