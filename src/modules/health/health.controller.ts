import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetHealthResponseDto } from './models/get-health-response.dto';
import { importPackageJson } from 'src/shared/utils/import-package-json';
import { Public } from '../auth/public.decorator';

@ApiTags('health-check')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOkResponse({
    description: 'The health check response',
    type: GetHealthResponseDto,
  })
  health(): GetHealthResponseDto {
    const healthResponse: GetHealthResponseDto = {
      version: importPackageJson().version,
      uptime: Math.floor(process.uptime()),
    };

    return healthResponse;
  }
}
