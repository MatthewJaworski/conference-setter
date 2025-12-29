import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get headers for authenticating in microservices', () => {
    const config = service.getMicroservicesAuthHeaders();

    expect(config).toHaveProperty('headers');
    expect(config.headers?.['Accept-Language']).toEqual('pl');
  });
});
