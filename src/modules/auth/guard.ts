import {
  CanActivate,
  ExecutionContext,
  FactoryProvider,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { APP_GUARD, ModuleRef, Reflector } from '@nestjs/core';
import { Public } from '@/modules/auth/public.decorator';
import { JwtVerifier } from '@/modules/auth/jwt-verifier';
import { Request } from 'express';
import { AuthResult } from 'express-oauth2-jwt-bearer';
import { ConfigService } from '@nestjs/config';
import { bypassAuthentication } from '@/modules/auth/config';

/**
 * This factory builds the authentication guard for the application.
 * The implementation depends on the environment the application is being run in.
 * By default, the application will use the AuthGuard class.
 * On internal environments, we allow to bypass the authentication and create an ergonomic experience for developers.
 */
export const SecurityGuard: FactoryProvider<CanActivate> = {
  provide: APP_GUARD,
  useFactory: async (config: ConfigService, module: ModuleRef) => {
    const logger = new Logger('AuthFactory');
    const regular = await module.create(AuthGuard);

    if (bypassAuthentication(config)) {
      logger.warn('Authentication is in development mode, due to APP_BYPASS_AUTH=true.');
      return new DevelopmentGuard(regular);
    } else {
      logger.verbose('Authentication is enabled');
      return regular;
    }
  },
  inject: [ConfigService, ModuleRef],
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly verifier: JwtVerifier,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(Public(), [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<Request>();
    try {
      await this.verifier.authenticate(request);
      this.assertClaims(request);
      return true;
    } catch (err) {
      if (isPublicRoute) {
        return true;
      } else {
        throw err;
      }
    }
  }

  assertClaims(request: Request): asserts request is Request & { auth: AuthResult } {
    if (!request.auth) {
      throw new InternalServerErrorException('Authentication did not set claims on request');
    }
  }
}

@Injectable()
export class DevelopmentGuard implements CanActivate {
  constructor(private readonly regularGuard: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp()?.getRequest<Request>();

    if (request) {
      const id = request.header('x-id-claim') ?? 'dev-user';

      request.auth = {
        payload: {
          ['id']: id,
        },
        header: {},
        token: '',
      };
      return true;
    }

    return await this.regularGuard.canActivate(context);
  }
}
