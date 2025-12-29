import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetHealthResponseDto } from './models/get-health-response.dto';
import { importPackageJson } from 'src/shared/utils/import-package-json';
import { EnableSwaggerAuth } from '../auth/enable-swagger-auth';
import { UserClaim, UserClaimsDto } from '../auth/user-claims';

@EnableSwaggerAuth()
@ApiTags('health-check-authenticated')
@Controller('health-authenticated')
export class HealthAuthenticatedController {
  private readonly logger = new Logger(HealthAuthenticatedController.name);
  @Get()
  @ApiOkResponse({
    description: 'The health check response',
    type: GetHealthResponseDto,
  })
  health(@UserClaim() user: UserClaimsDto): GetHealthResponseDto {
    this.logger.log(`Authenticated user: ${JSON.stringify(user)}`);

    const healthResponse: GetHealthResponseDto = {
      version: importPackageJson().version,
      uptime: Math.floor(process.uptime()),
    };

    return healthResponse;
  }
}
