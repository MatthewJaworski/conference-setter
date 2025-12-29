export interface JsonWebToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType: string;
  scope: string;
  sessionState: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  preferredUsername: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  emailVerified?: boolean;
  realmRoles?: string[];
}
