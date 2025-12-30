import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Headers,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EnableSwaggerAuth } from '../../auth/enable-swagger-auth';
import { AgendaService } from '../services/agenda.service';
import { AgendaTrackService } from '../services/agenda-track.service';
import { AgendaItemService } from '../services/agenda-item.service';
import { AgendaTrackDto } from '../dtos/agenda-track.dto';
import { AgendaItemDto } from '../dtos/agenda-item.dto';
import {
  CreateAgendaTrackCommand,
  CreateAgendaSlotCommand,
  AssignPlaceholderAgendaSlotCommand,
  AssignRegularAgendaSlotCommand,
} from '../dtos/agenda-commands.dto';
import { Public } from '../../auth/public.decorator';

@EnableSwaggerAuth()
@ApiTags('agenda')
@Controller('agenda/conferences/:conferenceId')
export class AgendaController {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaTrackService: AgendaTrackService,
    private readonly agendaItemService: AgendaItemService,
  ) {}

  @Get('tracks/:id')
  @Public()
  @ApiOkResponse({ description: 'Agenda track retrieved', type: AgendaTrackDto })
  async getAgendaTrackAsync(@Param('id') id: string): Promise<AgendaTrackDto> {
    return await this.agendaTrackService.getAsync(id);
  }

  @Get('tracks')
  @Public()
  @ApiOkResponse({ description: 'Agenda tracks retrieved', type: [AgendaTrackDto] })
  async getAgendaAsync(): Promise<AgendaTrackDto[]> {
    return await this.agendaTrackService.browseAsync();
  }

  @Get('items')
  @Public()
  @ApiOkResponse({ description: 'Agenda items retrieved', type: [AgendaItemDto] })
  async browseAgendaItemsAsync(): Promise<AgendaItemDto[]> {
    return await this.agendaItemService.browseAsync();
  }

  @Get('items/:id')
  @Public()
  @ApiOkResponse({ description: 'Agenda item retrieved', type: AgendaItemDto })
  async getAgendaItemAsync(@Param('id') id: string): Promise<AgendaItemDto> {
    return await this.agendaItemService.getAsync(id);
  }

  @Post('tracks')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Agenda track created' })
  async createAgendaTrackAsync(
    @Param('conferenceId') conferenceId: string,
    @Body() command: CreateAgendaTrackCommand,
    @Headers('x-id-claim') userId?: string,
    @Headers('authorization') authorization?: string,
  ): Promise<void> {
    await this.agendaService.createAgendaTrackAsync(
      conferenceId,
      command.name,
      userId,
      authorization,
    );
  }

  @Post('slots')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Agenda slot created' })
  async createAgendaSlotAsync(@Body() command: CreateAgendaSlotCommand): Promise<void> {
    await this.agendaService.createAgendaSlotAsync(
      command.agendaTrackId,
      command.type,
      command.from,
      command.to,
      command.participantsLimit,
    );
  }

  @Put('slots/placeholder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Placeholder assigned to slot' })
  async assignPlaceholderAgendaSlotAsync(
    @Body() command: AssignPlaceholderAgendaSlotCommand,
  ): Promise<void> {
    await this.agendaService.assignPlaceholderAgendaSlotAsync(
      command.agendaTrackId,
      command.agendaSlotId,
      command.placeholder,
    );
  }

  @Put('slots/regular')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Agenda item assigned to slot' })
  async assignRegularAgendaSlotAsync(
    @Body() command: AssignRegularAgendaSlotCommand,
  ): Promise<void> {
    await this.agendaService.assignRegularAgendaSlotAsync(
      command.agendaTrackId,
      command.agendaSlotId,
      command.agendaItemId,
    );
  }
}
