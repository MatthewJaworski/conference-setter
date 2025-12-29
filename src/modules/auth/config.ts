import { ConfigService } from '@nestjs/config';

export function bypassAuthentication(config: ConfigService): boolean {
  const isProd = config.get<string>('NODE_ENV') === 'prd';
  const useBypass = config.get<string>('APP_BYPASS_AUTH') === 'true';
  return !isProd && useBypass;
}
