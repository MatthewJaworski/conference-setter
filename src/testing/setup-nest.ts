import { ConfigService } from '@nestjs/config';
import { VALIDATED_ENV_PROPNAME } from '@nestjs/config/dist/config.constants';
/**
 * Creates an instance of {ConfigService} that can be used directly.
 * The given variables will override entries normally read from `process.env`.
 * Variables not specified will, as usual, be read from process.env by ConfigService.
 *
 * @param variables - The environment variables to override in the configuration.
 */
export function setupConfig<T>(variables: T): ConfigService<T> {
  return new ConfigService({
    [VALIDATED_ENV_PROPNAME]: variables,
  });
}
