import { EnableSwaggerAuth } from '@/modules/auth/enable-swagger-auth';
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
import { SpeakerService } from '../services/speaker.service';
import { SpeakerDto } from '../dtos/speaker.dto';
import { Public } from '@/modules/auth/public.decorator';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';

@EnableSwaggerAuth()
@ApiTags('conference')
@Controller('speakers')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Speaker details retrieved successfully',
    type: SpeakerDto,
  })
  async get(@Param('id') id: string) {
    return await this.speakerService.getAsync(id);
  }

  @Public()
  @Get()
  @ApiOkResponse({
    description: 'List of all speakers',
    type: [SpeakerDto],
  })
  async browse() {
    return await this.speakerService.browseAsync();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Speaker created successfully',
  })
  async add(@Body() dto: CreateSpeakerDto) {
    await this.speakerService.addAsync(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Speaker updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    const updateDto = { ...dto, id };
    await this.speakerService.updateAsync(updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Speaker deleted successfully',
  })
  async delete(@Param('id') id: string) {
    await this.speakerService.deleteAsync(id);
  }
}
