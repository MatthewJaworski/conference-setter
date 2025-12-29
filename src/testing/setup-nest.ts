import { ConfigService } from '@nestjs/config';
import { VALIDATED_ENV_PROPNAME } from '@nestjs/config/dist/config.constants';
import { ExecutionContext, Type } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

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

/**
 * Creates an ExecutionHost usable for tests involving the Reflector class.
 * Does not support the `switchToHttp`, `switchToRpc`, or `switchToWs` methods.
 *
 * @param constructor - The class containing the method to be tested.
 * @param method - The name of the method to be tested.
 */
export function setupContext<T>(constructor: Type<T>, method: keyof T): ExecutionContext {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
  return new ExecutionContextHost([], constructor, constructor.prototype[method]);
}
