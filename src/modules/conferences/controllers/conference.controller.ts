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
import { ConferenceService } from '../services/conference.service';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';

@EnableSwaggerAuth()
@ApiTags('conference')
@Controller('conference')
export class ConferenceController {
  constructor(private readonly conferenceService: ConferenceService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Conference details retrieved successfully',
    type: ConferenceDetailsDto,
  })
  async get(@Param('id') id: string) {
    return await this.conferenceService.getAsync(id);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of all conferences',
    type: [ConferenceDetailsDto],
  })
  async browse() {
    return await this.conferenceService.browseAsync();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Conference created successfully',
  })
  async add(@Body() dto: ConferenceCreateDto) {
    await this.conferenceService.addAsync(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Conference updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: ConferenceUpdateDto) {
    const updateDto = { ...dto, id };
    await this.conferenceService.updateAsync(updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Conference deleted successfully',
  })
  async delete(@Param('id') id: string) {
    await this.conferenceService.deleteAsync(id);
  }
}
