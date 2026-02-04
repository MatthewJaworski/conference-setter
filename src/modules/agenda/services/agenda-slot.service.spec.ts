import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AgendaSlotService } from './agenda-slot.service';
import { AgendaSlotRepository } from '../repositories/agenda-slot.repository';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { AgendaSlotDto } from '../dtos/agenda-slot.dto';
import { CreateAgendaSlotDto } from '../dtos/create-agenda-slot.dto';
import { UpdateAgendaSlotDto } from '../dtos/update-agenda-slot.dto';

describe('AgendaSlotService', () => {
  let service: AgendaSlotService;
  let repository: jest.Mocked<AgendaSlotRepository>;

  const mockAgendaSlot: AgendaSlotDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T10:00:00Z'),
    trackId: '123e4567-e89b-12d3-a456-426614174001',
  };

  const mockAgendaSlots: AgendaSlotDto[] = [
    mockAgendaSlot,
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      from: new Date('2024-01-15T10:00:00Z'),
      to: new Date('2024-01-15T11:00:00Z'),
      trackId: '123e4567-e89b-12d3-a456-426614174001',
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaSlotService,
        {
          provide: AgendaSlotRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgendaSlotService>(AgendaSlotService);
    repository = module.get(AgendaSlotRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return agenda slot when found', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaSlot);

      const result = await service.getAsync(mockAgendaSlot.id);

      expect(result).toEqual(mockAgendaSlot);
      expect(repository.getAsync).toHaveBeenCalledWith(mockAgendaSlot.id);
    });

    it('should return null when agenda slot not found', async () => {
      repository.getAsync.mockResolvedValue(null);

      const result = await service.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all agenda slots', async () => {
      repository.browseAsync.mockResolvedValue(mockAgendaSlots);

      const result = await service.browseAsync();

      expect(result).toEqual(mockAgendaSlots);
      expect(repository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no agenda slots exist', async () => {
      repository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaSlotDto = {
      from: '2024-01-15T09:00:00Z',
      to: '2024-01-15T10:00:00Z',
      trackId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should add agenda slot successfully', async () => {
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(repository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should add agenda slot without trackId', async () => {
      const dtoWithoutTrack: CreateAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T10:00:00Z',
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithoutTrack);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithoutTrack);
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: CreateAgendaSlotDto = {
        from: '2024-01-15T11:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };

      await expect(service.addAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const dtoWithSameDates: CreateAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };

      await expect(service.addAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaSlotDto = {
      id: mockAgendaSlot.id,
      from: '2024-01-15T08:00:00Z',
      to: '2024-01-15T09:30:00Z',
    };

    it('should update agenda slot successfully', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(repository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(repository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw NotFoundException when agenda slot does not exist', async () => {
      repository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateAsync(updateDto)).rejects.toThrow(
        `Agenda slot ${updateDto.id} not found.`,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        from: '2024-01-15T12:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);

      await expect(service.updateAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const dtoWithSameDates: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);

      await expect(service.updateAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should update only from date using existing to date', async () => {
      const dtoWithOnlyFrom: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        from: '2024-01-15T08:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyFrom);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyFrom);
    });

    it('should update only to date using existing from date', async () => {
      const dtoWithOnlyTo: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        to: '2024-01-15T11:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyTo);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyTo);
    });

    it('should throw WrongDatesException when only updating from date to be after existing to date', async () => {
      const dtoWithInvalidFrom: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        from: '2024-01-15T11:00:00Z', // existing to is 10:00
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);

      await expect(service.updateAsync(dtoWithInvalidFrom)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when only updating to date to be before existing from date', async () => {
      const dtoWithInvalidTo: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        to: '2024-01-15T08:00:00Z', // existing from is 09:00
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);

      await expect(service.updateAsync(dtoWithInvalidTo)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow updating only trackId', async () => {
      const dtoWithOnlyTrackId: UpdateAgendaSlotDto = {
        id: mockAgendaSlot.id,
        trackId: '123e4567-e89b-12d3-a456-426614174999',
      };
      repository.getAsync.mockResolvedValue(mockAgendaSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyTrackId);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyTrackId);
    });
  });

  describe('deleteAsync', () => {
    it('should delete agenda slot successfully', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaSlot);
      repository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockAgendaSlot.id);

      expect(repository.getAsync).toHaveBeenCalledWith(mockAgendaSlot.id);
      expect(repository.deleteAsync).toHaveBeenCalledWith(mockAgendaSlot.id);
    });

    it('should throw NotFoundException when agenda slot does not exist', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteAsync(id)).rejects.toThrow(`Agenda slot ${id} not found.`);
      expect(repository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
