import { Test, TestingModule } from '@nestjs/testing';
import { AgendaController } from './agenda.controller';
import { AgendaService, AgendaSlotType } from '../services/agenda.service';
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

describe('AgendaController', () => {
  let controller: AgendaController;
  let agendaService: jest.Mocked<AgendaService>;
  let agendaTrackService: jest.Mocked<AgendaTrackService>;
  let agendaItemService: jest.Mocked<AgendaItemService>;

  const mockAgendaTrack: AgendaTrackDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    conferenceId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Main Hall',
    version: 0,
  };

  const mockAgendaItem: AgendaItemDto = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    conferenceId: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Opening Keynote',
    description: 'Welcome to the conference',
    level: 1,
    tags: ['keynote'],
    speakerIds: ['speaker-1'],
    version: 0,
  };

  beforeEach(async () => {
    const mockAgendaService = {
      createAgendaTrackAsync: jest.fn(),
      createAgendaSlotAsync: jest.fn(),
      assignPlaceholderAgendaSlotAsync: jest.fn(),
      assignRegularAgendaSlotAsync: jest.fn(),
    };

    const mockAgendaTrackService = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
    };

    const mockAgendaItemService = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [
        { provide: AgendaService, useValue: mockAgendaService },
        { provide: AgendaTrackService, useValue: mockAgendaTrackService },
        { provide: AgendaItemService, useValue: mockAgendaItemService },
      ],
    }).compile();

    controller = module.get<AgendaController>(AgendaController);
    agendaService = module.get(AgendaService);
    agendaTrackService = module.get(AgendaTrackService);
    agendaItemService = module.get(AgendaItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAgendaTrackAsync', () => {
    it('should return a single agenda track', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);

      const result = await controller.getAgendaTrackAsync(mockAgendaTrack.id);

      expect(result).toEqual(mockAgendaTrack);
      expect(agendaTrackService.getAsync).toHaveBeenCalledWith(mockAgendaTrack.id);
    });

    it('should call getAsync with the provided id', async () => {
      const trackId = 'test-track-id';
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);

      await controller.getAgendaTrackAsync(trackId);

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith(trackId);
      expect(agendaTrackService.getAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAgendaAsync', () => {
    it('should return all agenda tracks', async () => {
      const mockTracks = [mockAgendaTrack, { ...mockAgendaTrack, id: 'track-2', name: 'Room A' }];
      agendaTrackService.browseAsync.mockResolvedValue(mockTracks);

      const result = await controller.getAgendaAsync();

      expect(result).toEqual(mockTracks);
      expect(agendaTrackService.browseAsync).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no tracks exist', async () => {
      agendaTrackService.browseAsync.mockResolvedValue([]);

      const result = await controller.getAgendaAsync();

      expect(result).toEqual([]);
    });
  });

  describe('browseAgendaItemsAsync', () => {
    it('should return all agenda items', async () => {
      const mockItems = [mockAgendaItem, { ...mockAgendaItem, id: 'item-2', title: 'Workshop' }];
      agendaItemService.browseAsync.mockResolvedValue(mockItems);

      const result = await controller.browseAgendaItemsAsync();

      expect(result).toEqual(mockItems);
      expect(agendaItemService.browseAsync).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no items exist', async () => {
      agendaItemService.browseAsync.mockResolvedValue([]);

      const result = await controller.browseAgendaItemsAsync();

      expect(result).toEqual([]);
    });
  });

  describe('getAgendaItemAsync', () => {
    it('should return a single agenda item', async () => {
      agendaItemService.getAsync.mockResolvedValue(mockAgendaItem);

      const result = await controller.getAgendaItemAsync(mockAgendaItem.id);

      expect(result).toEqual(mockAgendaItem);
      expect(agendaItemService.getAsync).toHaveBeenCalledWith(mockAgendaItem.id);
    });

    it('should call getAsync with the provided id', async () => {
      const itemId = 'test-item-id';
      agendaItemService.getAsync.mockResolvedValue(mockAgendaItem);

      await controller.getAgendaItemAsync(itemId);

      expect(agendaItemService.getAsync).toHaveBeenCalledWith(itemId);
      expect(agendaItemService.getAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('createAgendaTrackAsync', () => {
    it('should create an agenda track', async () => {
      const conferenceId = '123e4567-e89b-12d3-a456-426614174001';
      const command: CreateAgendaTrackCommand = { name: 'Main Hall' };
      const userId = 'user-123';
      const authorization = 'Bearer token123';

      agendaService.createAgendaTrackAsync.mockResolvedValue(undefined);

      await controller.createAgendaTrackAsync(conferenceId, command, userId, authorization);

      expect(agendaService.createAgendaTrackAsync).toHaveBeenCalledWith(
        conferenceId,
        command.name,
        userId,
        authorization,
      );
    });

    it('should create an agenda track without optional headers', async () => {
      const conferenceId = '123e4567-e89b-12d3-a456-426614174001';
      const command: CreateAgendaTrackCommand = { name: 'Workshop Room' };

      agendaService.createAgendaTrackAsync.mockResolvedValue(undefined);

      await controller.createAgendaTrackAsync(conferenceId, command);

      expect(agendaService.createAgendaTrackAsync).toHaveBeenCalledWith(
        conferenceId,
        command.name,
        undefined,
        undefined,
      );
    });

    it('should return void on successful creation', async () => {
      const conferenceId = 'conference-id';
      const command: CreateAgendaTrackCommand = { name: 'Track Name' };

      agendaService.createAgendaTrackAsync.mockResolvedValue(undefined);

      const result = await controller.createAgendaTrackAsync(conferenceId, command);

      expect(result).toBeUndefined();
    });
  });

  describe('createAgendaSlotAsync', () => {
    it('should create a regular agenda slot', async () => {
      const command: CreateAgendaSlotCommand = {
        agendaTrackId: '123e4567-e89b-12d3-a456-426614174000',
        type: AgendaSlotType.Regular,
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T10:00:00Z',
        participantsLimit: 50,
      };

      agendaService.createAgendaSlotAsync.mockResolvedValue(undefined);

      await controller.createAgendaSlotAsync(command);

      expect(agendaService.createAgendaSlotAsync).toHaveBeenCalledWith(
        command.agendaTrackId,
        command.type,
        command.from,
        command.to,
        command.participantsLimit,
      );
    });

    it('should create a placeholder agenda slot', async () => {
      const command: CreateAgendaSlotCommand = {
        agendaTrackId: '123e4567-e89b-12d3-a456-426614174000',
        type: AgendaSlotType.Placeholder,
        from: '2024-01-15T12:00:00Z',
        to: '2024-01-15T13:00:00Z',
      };

      agendaService.createAgendaSlotAsync.mockResolvedValue(undefined);

      await controller.createAgendaSlotAsync(command);

      expect(agendaService.createAgendaSlotAsync).toHaveBeenCalledWith(
        command.agendaTrackId,
        command.type,
        command.from,
        command.to,
        undefined,
      );
    });

    it('should return void on successful creation', async () => {
      const command: CreateAgendaSlotCommand = {
        agendaTrackId: 'track-id',
        type: AgendaSlotType.Regular,
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T10:00:00Z',
      };

      agendaService.createAgendaSlotAsync.mockResolvedValue(undefined);

      const result = await controller.createAgendaSlotAsync(command);

      expect(result).toBeUndefined();
    });
  });

  describe('assignPlaceholderAgendaSlotAsync', () => {
    it('should assign a placeholder to an agenda slot', async () => {
      const command: AssignPlaceholderAgendaSlotCommand = {
        agendaTrackId: '123e4567-e89b-12d3-a456-426614174000',
        agendaSlotId: '123e4567-e89b-12d3-a456-426614174003',
        placeholder: 'Coffee Break',
      };

      agendaService.assignPlaceholderAgendaSlotAsync.mockResolvedValue(undefined);

      await controller.assignPlaceholderAgendaSlotAsync(command);

      expect(agendaService.assignPlaceholderAgendaSlotAsync).toHaveBeenCalledWith(
        command.agendaTrackId,
        command.agendaSlotId,
        command.placeholder,
      );
    });

    it('should return void on successful assignment', async () => {
      const command: AssignPlaceholderAgendaSlotCommand = {
        agendaTrackId: 'track-id',
        agendaSlotId: 'slot-id',
        placeholder: 'Lunch Break',
      };

      agendaService.assignPlaceholderAgendaSlotAsync.mockResolvedValue(undefined);

      const result = await controller.assignPlaceholderAgendaSlotAsync(command);

      expect(result).toBeUndefined();
    });
  });

  describe('assignRegularAgendaSlotAsync', () => {
    it('should assign an agenda item to a slot', async () => {
      const command: AssignRegularAgendaSlotCommand = {
        agendaTrackId: '123e4567-e89b-12d3-a456-426614174000',
        agendaSlotId: '123e4567-e89b-12d3-a456-426614174003',
        agendaItemId: '123e4567-e89b-12d3-a456-426614174004',
      };

      agendaService.assignRegularAgendaSlotAsync.mockResolvedValue(undefined);

      await controller.assignRegularAgendaSlotAsync(command);

      expect(agendaService.assignRegularAgendaSlotAsync).toHaveBeenCalledWith(
        command.agendaTrackId,
        command.agendaSlotId,
        command.agendaItemId,
      );
    });

    it('should return void on successful assignment', async () => {
      const command: AssignRegularAgendaSlotCommand = {
        agendaTrackId: 'track-id',
        agendaSlotId: 'slot-id',
        agendaItemId: 'item-id',
      };

      agendaService.assignRegularAgendaSlotAsync.mockResolvedValue(undefined);

      const result = await controller.assignRegularAgendaSlotAsync(command);

      expect(result).toBeUndefined();
    });
  });
});
