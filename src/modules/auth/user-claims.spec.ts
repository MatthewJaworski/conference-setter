import { ExecutionContext } from '@nestjs/common';
import { extractTokenClaims } from './user-claims';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { JWTPayload } from 'express-oauth2-jwt-bearer';
import { UnexpectedClaimsException } from '@/shared/exceptions/unexpected-claims.exception';

const mockHttpContext: jest.Mocked<HttpArgumentsHost> = {
  getRequest: jest.fn(),
  getResponse: jest.fn(),
  getNext: jest.fn(),
};

const mockExecutionContext: jest.Mocked<ExecutionContext> = {
  getType: jest.fn(),
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getClass: jest.fn(),
  getHandler: jest.fn(),
  switchToHttp: jest.fn(() => mockHttpContext),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

describe('User claims decorator', () => {
  it(`builds UserClaims from the 'auth' field on the request object`, () => {
    setupClaims({
      sub: 'd8d193fe-0192-416c-ab15-dfea21354f28',
      email: 'test@example.com',
      preferred_username: 'testuser',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      email_verified: true,
    });

    expect(extractTokenClaims({}, mockExecutionContext)).toMatchObject({
      id: 'd8d193fe-0192-416c-ab15-dfea21354f28',
      email: 'test@example.com',
      preferredUsername: 'testuser',
      name: 'Test User',
      givenName: 'Test',
      familyName: 'User',
      emailVerified: true,
    });
  });

  it.each([
    {
      when: 'sub claim is missing',
      claims: { email: 'test@example.com', preferred_username: 'testuser' },
    },
    { when: 'email claim is missing', claims: { sub: '12345', preferred_username: 'testuser' } },
    {
      when: 'preferred_username claim is missing',
      claims: { sub: '12345', email: 'test@example.com' },
    },
  ])('throws when $when', ({ claims }) => {
    setupClaims(claims);
    expect(() => extractTokenClaims({}, mockExecutionContext)).toThrow(UnexpectedClaimsException);
  });

  function setupClaims(claims: JWTPayload) {
    mockHttpContext.getRequest.mockReturnValue({
      auth: {
        token: '',
        header: {},
        payload: claims,
      },
    } as Partial<Request>);
  }
});
