import { HttpModule } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { importPackageJson } from 'src/shared/utils/import-package-json';

const UPTIME = 666;

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    process.uptime = () => UPTIME;

    const app = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [HealthController],
      providers: [],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  it('should return the correct health response', () => {
    expect(healthController.health()).toEqual({
      uptime: UPTIME,
      version: importPackageJson().version,
    });
  });
});
