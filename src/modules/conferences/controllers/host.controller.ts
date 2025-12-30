import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EnableSwaggerAuth } from '../../auth/enable-swagger-auth';
import { Public } from '../../auth/public.decorator';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { HostService } from '../services/host.service';
import { HostDetailsDto } from '../dtos/host-detials.dto';

@EnableSwaggerAuth()
@ApiTags('host')
@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Conference details retrieved successfully',
    type: ConferenceDetailsDto,
  })
  async get(@Param('id') id: string) {
    return await this.hostService.getAsync(id);
  }

  @Public()
  @Get()
  @ApiOkResponse({
    description: 'List of all conferences',
    type: [ConferenceDetailsDto],
  })
  async browse() {
    return await this.hostService.browseAsync();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Conference created successfully',
  })
  async add(@Body() dto: ConferenceDetailsDto) {
    await this.hostService.addAsync(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Conference updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: HostDetailsDto) {
    const updateDto = { ...dto, id };
    await this.hostService.updateAsync(updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Conference deleted successfully',
  })
  async delete(@Param('id') id: string) {
    await this.hostService.deleteAsync(id);
  }
}
