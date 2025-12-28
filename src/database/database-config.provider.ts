import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { optionalFlag, optionalString } from 'src/shared/utils/parse-env';

export function TypeOrmConfigProvider(configService: ConfigService): TypeOrmModuleOptions {
  const host = optionalString(configService.get('POSTGRES_HOST'), '');
  const username = optionalString(configService.get('POSTGRES_USER'), '');
  const password = optionalString(configService.get('POSTGRES_PASSWORD'), '');
  const database = optionalString(configService.get('POSTGRES_DATABASE'), '');
  const ssl = optionalFlag(configService.get('POSTGRES_SSL'), false);
  const logging = optionalFlag(configService.get('POSTGRES_LOGGING'), false);

  return {
    type: 'postgres',
    host,
    port: 5432,
    username,
    password,
    database,
    ssl,
    autoLoadEntities: true,
    synchronize: true,
    logging,
  };
}

export const TypeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: TypeOrmConfigProvider,
};
