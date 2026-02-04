import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AgendaService, AgendaSlotType } from './agenda.service';
import { AgendaTrackService } from './agenda-track.service';
import { PlaceholderAgendaSlotService } from './placeholder-agenda-slot.service';
import { RegularAgendaSlotService } from './regular-agenda-slot.service';
import { AgendaItemService } from './agenda-item.service';
import { AgendaTrackRepository } from '../repositories/agenda-track.repository';
import { RequestService } from '@/shared/services/request.service';
import { AgendaTrackDto } from '../dtos/agenda-track.dto';
import { PlaceholderAgendaSlotDto } from '../dtos/placeholder-agenda-slot.dto';
import { RegularAgendaSlotDto } from '../dtos/regular-agenda-slot.dto';
import { AgendaItemDto } from '../dtos/agenda-item.dto';

describe('AgendaService', () => {
  let service: AgendaService;
  let agendaTrackService: jest.Mocked<AgendaTrackService>;
  let placeholderAgendaSlotService: jest.Mocked<PlaceholderAgendaSlotService>;
  let regularAgendaSlotService: jest.Mocked<RegularAgendaSlotService>;
  let agendaItemService: jest.Mocked<AgendaItemService>;
  let agendaTrackRepository: jest.Mocked<AgendaTrackRepository>;
  let requestService: jest.Mocked<RequestService>;

  const mockAgendaTrack: AgendaTrackDto = {
    id: 'track-id-1',
    conferenceId: 'conference-id-1',
    name: 'Main Hall',
    version: 0,
  };

  const mockPlaceholderSlot: PlaceholderAgendaSlotDto = {
    id: 'placeholder-slot-id-1',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T09:30:00Z'),
    trackId: 'track-id-1',
    placeholder: 'Coffee Break',
  };

  const mockRegularSlot: RegularAgendaSlotDto = {
    id: 'regular-slot-id-1',
    from: new Date('2024-01-15T10:00:00Z'),
    to: new Date('2024-01-15T11:00:00Z'),
    trackId: 'track-id-1',
    participantsLimit: 50,
    agendaItemId: undefined,
  };

  const mockAgendaItem: AgendaItemDto = {
    id: 'agenda-item-id-1',
    conferenceId: 'conference-id-1',
    title: 'Opening Keynote',
    description: 'An introduction to the conference',
    level: 2,
    tags: ['keynote'],
    speakerIds: [],
    version: 0,
  };

  beforeEach(async () => {
    const mockAgendaTrackService = {
      getAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const mockPlaceholderAgendaSlotService = {
      getAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
    };

    const mockRegularAgendaSlotService = {
      getAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
    };

    const mockAgendaItemService = {
      getAsync: jest.fn(),
    };

    const mockAgendaTrackRepository = {
      existsAsync: jest.fn(),
    };

    const mockRequestService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        { provide: AgendaTrackService, useValue: mockAgendaTrackService },
        { provide: PlaceholderAgendaSlotService, useValue: mockPlaceholderAgendaSlotService },
        { provide: RegularAgendaSlotService, useValue: mockRegularAgendaSlotService },
        { provide: AgendaItemService, useValue: mockAgendaItemService },
        { provide: AgendaTrackRepository, useValue: mockAgendaTrackRepository },
        { provide: RequestService, useValue: mockRequestService },
      ],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
    agendaTrackService = module.get(AgendaTrackService);
    placeholderAgendaSlotService = module.get(PlaceholderAgendaSlotService);
    regularAgendaSlotService = module.get(RegularAgendaSlotService);
    agendaItemService = module.get(AgendaItemService);
    agendaTrackRepository = module.get(AgendaTrackRepository);
    requestService = module.get(RequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignPlaceholderAgendaSlotAsync', () => {
    it('should assign placeholder to agenda slot successfully', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      placeholderAgendaSlotService.getAsync.mockResolvedValue(mockPlaceholderSlot);
      placeholderAgendaSlotService.updateAsync.mockResolvedValue(undefined);

      await service.assignPlaceholderAgendaSlotAsync(
        'track-id-1',
        'placeholder-slot-id-1',
        'Lunch Break',
      );

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith('track-id-1');
      expect(placeholderAgendaSlotService.getAsync).toHaveBeenCalledWith('placeholder-slot-id-1');
      expect(placeholderAgendaSlotService.updateAsync).toHaveBeenCalledWith({
        id: 'placeholder-slot-id-1',
        placeholder: 'Lunch Break',
      });
    });

    it('should throw NotFoundException when agenda track not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(null as unknown as AgendaTrackDto);

      await expect(
        service.assignPlaceholderAgendaSlotAsync(
          'non-existent-track',
          'placeholder-slot-id-1',
          'Break',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when placeholder slot not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      placeholderAgendaSlotService.getAsync.mockResolvedValue(null);

      await expect(
        service.assignPlaceholderAgendaSlotAsync('track-id-1', 'non-existent-slot', 'Break'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw Error when slot does not belong to track', async () => {
      const slotFromDifferentTrack: PlaceholderAgendaSlotDto = {
        ...mockPlaceholderSlot,
        trackId: 'different-track-id',
      };
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      placeholderAgendaSlotService.getAsync.mockResolvedValue(slotFromDifferentTrack);

      await expect(
        service.assignPlaceholderAgendaSlotAsync('track-id-1', 'placeholder-slot-id-1', 'Break'),
      ).rejects.toThrow('Agenda slot placeholder-slot-id-1 does not belong to track track-id-1.');
    });
  });

  describe('assignRegularAgendaSlotAsync', () => {
    it('should assign agenda item to regular slot successfully', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      regularAgendaSlotService.getAsync.mockResolvedValue(mockRegularSlot);
      agendaItemService.getAsync.mockResolvedValue(mockAgendaItem);
      regularAgendaSlotService.updateAsync.mockResolvedValue(undefined);

      await service.assignRegularAgendaSlotAsync(
        'track-id-1',
        'regular-slot-id-1',
        'agenda-item-id-1',
      );

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith('track-id-1');
      expect(regularAgendaSlotService.getAsync).toHaveBeenCalledWith('regular-slot-id-1');
      expect(agendaItemService.getAsync).toHaveBeenCalledWith('agenda-item-id-1');
      expect(regularAgendaSlotService.updateAsync).toHaveBeenCalledWith({
        id: 'regular-slot-id-1',
        agendaItemId: 'agenda-item-id-1',
      });
    });

    it('should throw NotFoundException when agenda track not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(null as unknown as AgendaTrackDto);

      await expect(
        service.assignRegularAgendaSlotAsync(
          'non-existent-track',
          'regular-slot-id-1',
          'agenda-item-id-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when regular slot not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      regularAgendaSlotService.getAsync.mockResolvedValue(null);

      await expect(
        service.assignRegularAgendaSlotAsync('track-id-1', 'non-existent-slot', 'agenda-item-id-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw Error when slot does not belong to track', async () => {
      const slotFromDifferentTrack: RegularAgendaSlotDto = {
        ...mockRegularSlot,
        trackId: 'different-track-id',
      };
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      regularAgendaSlotService.getAsync.mockResolvedValue(slotFromDifferentTrack);

      await expect(
        service.assignRegularAgendaSlotAsync('track-id-1', 'regular-slot-id-1', 'agenda-item-id-1'),
      ).rejects.toThrow('Agenda slot regular-slot-id-1 does not belong to track track-id-1.');
    });

    it('should throw NotFoundException when agenda item not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      regularAgendaSlotService.getAsync.mockResolvedValue(mockRegularSlot);
      agendaItemService.getAsync.mockRejectedValue(new NotFoundException());

      await expect(
        service.assignRegularAgendaSlotAsync(
          'track-id-1',
          'regular-slot-id-1',
          'non-existent-item',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeAgendaTrackNameAsync', () => {
    it('should change agenda track name successfully', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      agendaTrackService.updateAsync.mockResolvedValue(undefined);

      await service.changeAgendaTrackNameAsync('track-id-1', 'New Track Name');

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith('track-id-1');
      expect(agendaTrackService.updateAsync).toHaveBeenCalledWith({
        id: 'track-id-1',
        name: 'New Track Name',
      });
    });

    it('should throw NotFoundException when agenda track not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(null as unknown as AgendaTrackDto);

      await expect(
        service.changeAgendaTrackNameAsync('non-existent-track', 'New Name'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAgendaSlotAsync', () => {
    const from = '2024-01-15T09:00:00Z';
    const to = '2024-01-15T10:00:00Z';

    it('should create regular agenda slot successfully', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      regularAgendaSlotService.addAsync.mockResolvedValue(undefined);

      await service.createAgendaSlotAsync('track-id-1', AgendaSlotType.Regular, from, to, 100);

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith('track-id-1');
      expect(regularAgendaSlotService.addAsync).toHaveBeenCalledWith({
        from,
        to,
        trackId: 'track-id-1',
        participantsLimit: 100,
      });
    });

    it('should create regular agenda slot without participants limit', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      regularAgendaSlotService.addAsync.mockResolvedValue(undefined);

      await service.createAgendaSlotAsync('track-id-1', AgendaSlotType.Regular, from, to);

      expect(regularAgendaSlotService.addAsync).toHaveBeenCalledWith({
        from,
        to,
        trackId: 'track-id-1',
        participantsLimit: undefined,
      });
    });

    it('should create placeholder agenda slot successfully', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      placeholderAgendaSlotService.addAsync.mockResolvedValue(undefined);

      await service.createAgendaSlotAsync('track-id-1', AgendaSlotType.Placeholder, from, to);

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith('track-id-1');
      expect(placeholderAgendaSlotService.addAsync).toHaveBeenCalledWith({
        from,
        to,
        trackId: 'track-id-1',
      });
    });

    it('should throw NotFoundException when agenda track not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(null as unknown as AgendaTrackDto);

      await expect(
        service.createAgendaSlotAsync('non-existent-track', AgendaSlotType.Regular, from, to),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAgendaTrackAsync', () => {
    const conferenceId = 'conference-id-1';
    const trackName = 'Main Hall';
    const userId = 'user-id-1';
    const authorization = 'Bearer token';

    it('should create agenda track successfully', async () => {
      requestService.get.mockResolvedValue({ id: conferenceId, name: 'Test Conference' });
      agendaTrackRepository.existsAsync.mockResolvedValue(false);
      agendaTrackService.addAsync.mockResolvedValue(undefined);

      await service.createAgendaTrackAsync(conferenceId, trackName, userId, authorization);

      expect(requestService.get).toHaveBeenCalledWith(
        `http://localhost:3000/conference/${conferenceId}`,
        { userId, authorization },
      );
      expect(agendaTrackRepository.existsAsync).toHaveBeenCalledWith(conferenceId);
      expect(agendaTrackService.addAsync).toHaveBeenCalledWith({
        conferenceId,
        name: trackName,
      });
    });

    it('should create agenda track without optional headers', async () => {
      requestService.get.mockResolvedValue({ id: conferenceId, name: 'Test Conference' });
      agendaTrackRepository.existsAsync.mockResolvedValue(false);
      agendaTrackService.addAsync.mockResolvedValue(undefined);

      await service.createAgendaTrackAsync(conferenceId, trackName);

      expect(requestService.get).toHaveBeenCalledWith(
        `http://localhost:3000/conference/${conferenceId}`,
        { userId: undefined, authorization: undefined },
      );
    });

    it('should throw NotFoundException when conference not found', async () => {
      requestService.get.mockResolvedValue(null);

      await expect(service.createAgendaTrackAsync(conferenceId, trackName)).rejects.toThrow(
        NotFoundException,
      );
      expect(agendaTrackService.addAsync).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when agenda track already exists', async () => {
      requestService.get.mockResolvedValue({ id: conferenceId, name: 'Test Conference' });
      agendaTrackRepository.existsAsync.mockResolvedValue(true);

      await expect(service.createAgendaTrackAsync(conferenceId, trackName)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createAgendaTrackAsync(conferenceId, trackName)).rejects.toThrow(
        'Agenda track already exists.',
      );
      expect(agendaTrackService.addAsync).not.toHaveBeenCalled();
    });
  });

  describe('deleteAgendaTrackAsync', () => {
    it('should delete agenda track successfully', async () => {
      agendaTrackService.getAsync.mockResolvedValue(mockAgendaTrack);
      agendaTrackService.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAgendaTrackAsync('track-id-1');

      expect(agendaTrackService.getAsync).toHaveBeenCalledWith('track-id-1');
      expect(agendaTrackService.deleteAsync).toHaveBeenCalledWith('track-id-1');
    });

    it('should throw NotFoundException when agenda track not found', async () => {
      agendaTrackService.getAsync.mockResolvedValue(null as unknown as AgendaTrackDto);

      await expect(service.deleteAgendaTrackAsync('non-existent-track')).rejects.toThrow(
        NotFoundException,
      );
      expect(agendaTrackService.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
