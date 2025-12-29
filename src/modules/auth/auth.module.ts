import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtVerifier } from '@/modules/auth/jwt-verifier';
import { SecurityGuard } from '@/modules/auth/guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SecurityGuard, AuthService, JwtVerifier],
  exports: [AuthService],
})
export class AuthModule {}
