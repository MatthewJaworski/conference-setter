import { JwtVerifier } from '@/modules/auth/jwt-verifier';
import { setupConfig } from '@/testing/setup-nest';
import { createRequest, RequestOptions } from 'node-mocks-http';
import { Algorithm, sign } from 'jsonwebtoken';
import { JsonWebToken } from '@/shared/interfaces/auth/json-web-token';

describe('JwtVerifier', () => {
  const { verifier, secret, issuer, audience, algorithm } = setupVerifier();
  const expFuture = Date.now() / 1000 + 1000;
  const expPast = Date.now() / 1000 - 1000;
  const passingClaims = {
    iss: issuer,
    aud: audience,
    exp: expFuture,
  };

  it('throws when there is no Authorization header', async () => {
    await expect(testRequest({ headers: {} })).rejects.toThrow();
  });

  it('throws when the Authorization header contains a malformed token', async () => {
    await expect(testToken('this-is-not-a-jwt-token-string')).rejects.toThrow();
  });

  it('rejects unsigned JWTs', async () => {
    await expect(testToken(sign(passingClaims, null, { algorithm: 'none' }))).rejects.toThrow();
  });

  it('rejects JWTs not signed with the expected algorithm', async () => {
    await expect(testToken(sign(passingClaims, secret, { algorithm: 'HS512' }))).rejects.toThrow();
  });

  it('rejects HS256-signed tokens, when issuer claim is missing', async () => {
    await expect(testToken(signCorrectly({ ...passingClaims, iss: undefined }))).rejects.toThrow();
  });

  it('rejects expired token', async () => {
    await expect(testToken(signCorrectly({ ...passingClaims, exp: expPast }))).rejects.toThrow();
  });

  it('accepts a HS256-signed token, that is not expired and has issuer and audience claims matching the configuration', async () => {
    await expect(testToken(signCorrectly(passingClaims))).resolves.not.toThrow();
  });

  describe('request.auth field side-effect', () => {
    test('a request with a rejected token has the auth field set to undefined', async () => {
      const token = signCorrectly({ ...passingClaims, exp: expPast });
      const request = createRequest({ headers: { authorization: `Bearer ${token}` } });
      await expect(verifier.authenticate(request)).rejects.toThrow();
      expect(request.auth).toBeUndefined();
    });

    test(`an accepted token populates the request's auth field`, async () => {
      const token = signCorrectly(passingClaims);
      const request = createRequest({ headers: { authorization: `Bearer ${token}` } });
      await verifier.authenticate(request);
      expect(request.auth).toMatchObject({
        token: token,
        header: expect.any(Object) as Headers,
        payload: expect.objectContaining(passingClaims) as JsonWebToken,
      });
    });
  });

  async function testRequest(options?: RequestOptions) {
    return await verifier.authenticate(createRequest(options));
  }

  async function testToken(token: string) {
    return await testRequest({ headers: { authorization: `Bearer ${token}` } });
  }

  function signCorrectly(claims: object) {
    return sign(claims, secret, { algorithm });
  }
});

function setupVerifier() {
  const config = setupConfig({
    ['OKTA_ISSUER']: 'https://issuer.example.com/',
    ['OKTA_AUDIENCE']: 'https://audience.example.com/',
    ['OKTA_SIGNING_ALG']: 'HS256',
    ['OKTA_SIGNING_SECRET']: 'testing-signature',
  });

  return {
    config,
    issuer: config.getOrThrow<string>('OKTA_ISSUER'),
    audience: config.getOrThrow<string>('OKTA_AUDIENCE'),
    algorithm: config.getOrThrow<Algorithm>('OKTA_SIGNING_ALG'),
    secret: config.getOrThrow<string>('OKTA_SIGNING_SECRET'),
    verifier: new JwtVerifier(config),
  };
}
