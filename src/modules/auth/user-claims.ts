import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiHeader, ApiHeaderOptions, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Request } from 'express';
import { IsBoolean, IsEmail, IsOptional, IsString, validateSync } from 'class-validator';
import { Expose, plainToClass } from 'class-transformer';
import { flattenValidationErrors } from '@/shared/utils/flatten-validation-errors';
import { UnexpectedClaimsException } from '@/shared/exceptions/unexpected-claims.exception';
import { applyMethodDecorator } from '@/shared/decorators/apply-method-decorator';

export type User = {
  id: string;
  email: string;
  preferredUsername: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  emailVerified?: boolean;
};

export class UserClaimsDto implements User {
  @ApiProperty({
    description: 'The unique identifier of the user account',
  })
  @IsString()
  @Expose({ name: 'sub' })
  id!: string;

  @ApiProperty({
    description: 'The email address of the user',
  })
  @IsEmail()
  @Expose({ name: 'email' })
  email!: string;

  @ApiProperty({
    description: 'The username of the user',
  })
  @IsString()
  @Expose({ name: 'preferred_username' })
  preferredUsername!: string;

  @ApiPropertyOptional({
    description: 'The full name of the user',
  })
  @IsString()
  @IsOptional()
  @Expose({ name: 'name' })
  name?: string;

  @ApiPropertyOptional({
    description: 'The first name of the user',
  })
  @IsString()
  @IsOptional()
  @Expose({ name: 'given_name' })
  givenName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
  })
  @IsString()
  @IsOptional()
  @Expose({ name: 'family_name' })
  familyName?: string;

  @ApiPropertyOptional({
    description: 'Whether the email has been verified',
  })
  @IsBoolean()
  @IsOptional()
  @Expose({ name: 'email_verified' })
  emailVerified?: boolean;
}

export const extractTokenClaims = (
  decoratorArgs: unknown,
  ctx: ExecutionContext,
): UserClaimsDto => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const claims = request.auth?.payload || {};
  const userClaims = plainToClass(UserClaimsDto, claims);
  const validationErrors = flattenValidationErrors(validateSync(userClaims));
  if (validationErrors.length) {
    throw new UnexpectedClaimsException(...validationErrors);
  }
  return userClaims;
};

const claims: ApiHeaderOptions[] = [
  {
    required: false,
    name: 'x-id-claim',
    description: `The 'x-id-claim' header forces the user-id claim on the user session. Only for testing purposes, disabled for all non-local environments.`,
    schema: { type: 'string' },
  },
];

export function UserClaim(): ParameterDecorator {
  const extractTokens = createParamDecorator(extractTokenClaims)();
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) throw new TypeError('@UserClaim() must be applied to a method');
    extractTokens(target, propertyKey, parameterIndex);
    if (process.env.NODE_ENV === 'prd') return;
    claims.forEach((claim) => {
      applyMethodDecorator(ApiHeader(claim), target, propertyKey);
    });
  };
}
