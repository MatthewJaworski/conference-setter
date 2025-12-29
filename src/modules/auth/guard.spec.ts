import { AuthGuard, DevelopmentGuard, SecurityGuard } from '@/modules/auth/guard';
import { JwtVerifier } from '@/modules/auth/jwt-verifier';
import { Public } from '@/modules/auth/public.decorator';
import { setupConfig } from '@/testing/setup-nest';
import { ExecutionContext, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request } from 'express';

describe('SecurityGuard', () => {
  async function constructGuard(variables: Record<string, string>): Promise<unknown> {
    const config = setupConfig(variables);
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: config,
        },
        JwtVerifier,
        {
          ...SecurityGuard,
          provide: 'test',
        },
      ],
    }).compile();
    await moduleRef.init();
    return (await moduleRef.resolve('test')) as unknown;
  }

  test('Provides an instance of AuthGuard for normal authentication', async () => {
    expect(await constructGuard({})).toBeInstanceOf(AuthGuard);
  });

  test('Provides an instance of DevelopmentGuard when bypass is active', async () => {
    expect(await constructGuard({ APP_BYPASS_AUTH: 'true' })).toBeInstanceOf(DevelopmentGuard);
  });
});

describe('AuthGuard', () => {
  const { authGuard, verifier, controller } = setup();

  function mockAuthPassing() {
    verifier.authenticate.mockImplementation((request) => {
      verifierSideEffect(request);
      return Promise.resolve();
    });
  }
  function mockAuthFailure() {
    verifier.authenticate.mockRejectedValue(new Error('Mock authentication failure'));
  }

  const publicContext = setupExecutionContext(controller, 'public');
  const protectedContext = setupExecutionContext(controller, 'protected');

  test('A route without decorators requires authorization', async () => {
    expect.hasAssertions();
    mockAuthFailure();

    class WithoutDecorators {
      handler() {}
    }
    const controller = new WithoutDecorators();
    const context = setupExecutionContext(controller, 'handler');

    await expect(authGuard.canActivate(context)).rejects.toThrow();
  });

  describe('Without authentication data', () => {
    beforeEach(mockAuthFailure);

    test('A public route is activated', async () => {
      expect.hasAssertions();
      await expect(authGuard.canActivate(publicContext)).resolves.toBe(true);
    });

    test('A protected route is not activated', async () => {
      expect.hasAssertions();
      await expect(authGuard.canActivate(protectedContext)).rejects.toThrow();
    });
  });
  describe('With passing authentication', () => {
    beforeEach(mockAuthPassing);

    test('A public route is activated', async () => {
      expect.hasAssertions();
      await expect(authGuard.canActivate(publicContext)).resolves.toBe(true);
    });

    test('A protected route is activated', async () => {
      expect.hasAssertions();
      await expect(authGuard.canActivate(protectedContext)).resolves.toBe(true);
    });
  });

  function setup() {
    const verifier: jest.Mocked<JwtVerifier> = { authenticate: jest.fn() } as never;
    const authGuard = new AuthGuard(verifier as JwtVerifier, new Reflector());

    class TestController {
      @Public()
      public() {}
      protected() {}
    }

    return {
      verifier,
      authGuard,
      controller: new TestController(),
    };
  }

  function setupExecutionContext<T extends object>(instance: T, method: keyof T): ExecutionContext {
    return {
      getClass: jest.fn(() => instance.constructor as Type<never>),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      getHandler: jest.fn(() => instance[method] as Function),
      // ArgumentsHost interface
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({}) as never),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      // @ts-expect-error -- The generic cannot be adhered to, as it is arbitrary at the call-site
      getType: jest.fn(() => 'fake'),
    };
  }

  function verifierSideEffect(request: Request) {
    request.auth = {
      payload: {},
      token: '',
      header: {},
    };
  }
});

describe('DevelopmentGuard', () => {
  test('Without headers, it delegates to the regular guard', async () => {
    const regular = { canActivate: jest.fn(() => Promise.resolve(true)) };
    const guard = new DevelopmentGuard(regular as never);
    const context = {
      switchToHttp: jest.fn(() => null),
    };
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(regular.canActivate).toHaveBeenCalledWith(context);
  });

  test('With a x-bp-claim header, the request always authenticates', async () => {
    const regular = { canActivate: jest.fn(() => Promise.resolve(true)) };
    const guard = new DevelopmentGuard(regular as never);
    const request = {
      auth: undefined,
      header: jest.fn((header) => {
        switch (header) {
          case 'x-bp-claim':
            return 'bp';
          case 'x-id-claim':
            return 'id';
          default:
            return undefined;
        }
      }),
    };
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => request),
      })),
    };
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.auth).toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload: expect.objectContaining({
        ['id']: 'id',
      }),
    });
    expect(regular.canActivate).not.toHaveBeenCalled();
  });
});
