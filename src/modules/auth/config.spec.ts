import { bypassAuthentication } from '@/modules/auth/config';
import { setupConfig } from '@/testing/setup-nest';

describe('bypassAuthentication', () => {
  test('Never bypass authentication on production environments', () => {
    const config = setupConfig({ NODE_ENV: 'prd', APP_BYPASS_AUTH: 'true' });
    expect(bypassAuthentication(config)).toBe(false);
  });

  describe('Non-production environments', () => {
    test('Without APP_BYPASS_AUTH set, do not bypass authentication', () => {
      const config = setupConfig({ NODE_ENV: 'dev', APP_BYPASS_AUTH: '' });
      expect(bypassAuthentication(config)).toBe(false);
    });

    test('With APP_BYPASS_AUTH set to false, do not bypass authentication', () => {
      const config = setupConfig({ NODE_ENV: 'dev', APP_BYPASS_AUTH: 'false' });
      expect(bypassAuthentication(config)).toBe(false);
    });

    test('With APP_BYPASS_AUTH set to true, bypass authentication', () => {
      const config = setupConfig({ NODE_ENV: 'dev', APP_BYPASS_AUTH: 'true' });
      expect(bypassAuthentication(config)).toBe(true);
    });
  });
});
