import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { invalidTokenMessage, missingTokenMessage } from '@/shared/constants/exception-messages';
import { auth, AuthOptions, InvalidTokenError, UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { Request } from 'express';
import { InvalidTokenException } from '@/shared/exceptions/invalid-token.exception';
import { MissingTokenException } from '@/shared/exceptions/missing-token.exception';

@Injectable()
export class JwtVerifier {
  private readonly validateAccessToken;

  constructor(config: ConfigService) {
    const options: AuthOptions = {
      authRequired: true,
      issuer: config.getOrThrow<string>('OKTA_ISSUER'),
      audience: config.getOrThrow<string | string[]>('OKTA_AUDIENCE'),
      tokenSigningAlg: config.getOrThrow<string>('OKTA_SIGNING_ALG'),
    };

    const secret = config.get<string>('OKTA_SIGNING_SECRET');
    if (secret !== undefined) {
      // Use a locally configured secret to validate the tokens.
      options.secret = secret;
    } else {
      // Fetch the secret from a remote issuer's server.
      // This uses the JSON Web Key Set (JWKS) endpoint to fetch the public keys.
      options.issuerBaseURL = config.getOrThrow<string>('OKTA_ISSUER_BASE_URL');
    }

    //Convert the callback-based middleware to a promise
    this.validateAccessToken = (request: Request) =>
      new Promise<void>((resolve, reject) => {
        auth(options)(request, request.res! /* note: argument not used by lib */, (error) =>
          error ? reject(error as Error) : resolve(),
        );
      });
  }

  async authenticate(request: Request): Promise<void> {
    try {
      await this.validateAccessToken(request);
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        throw new InvalidTokenException(invalidTokenMessage);
      } else if (error instanceof UnauthorizedError) {
        throw new MissingTokenException(missingTokenMessage);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
