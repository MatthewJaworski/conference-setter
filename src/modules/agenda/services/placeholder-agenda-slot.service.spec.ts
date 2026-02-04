import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlaceholderAgendaSlotService } from './placeholder-agenda-slot.service';
import { PlaceholderAgendaSlotRepository } from '../repositories/placeholder-agenda-slot.repository';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { PlaceholderAgendaSlotDto } from '../dtos/placeholder-agenda-slot.dto';
import { CreatePlaceholderAgendaSlotDto } from '../dtos/create-placeholder-agenda-slot.dto';
import { UpdatePlaceholderAgendaSlotDto } from '../dtos/update-placeholder-agenda-slot.dto';

describe('PlaceholderAgendaSlotService', () => {
  let service: PlaceholderAgendaSlotService;
  let repository: jest.Mocked<PlaceholderAgendaSlotRepository>;

  const mockPlaceholderSlot: PlaceholderAgendaSlotDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T09:30:00Z'),
    trackId: '123e4567-e89b-12d3-a456-426614174001',
    placeholder: 'Coffee Break',
  };

  const mockPlaceholderSlots: PlaceholderAgendaSlotDto[] = [
    mockPlaceholderSlot,
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      from: new Date('2024-01-15T12:00:00Z'),
      to: new Date('2024-01-15T13:00:00Z'),
      trackId: '123e4567-e89b-12d3-a456-426614174001',
      placeholder: 'Lunch Break',
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
        PlaceholderAgendaSlotService,
        {
          provide: PlaceholderAgendaSlotRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PlaceholderAgendaSlotService>(PlaceholderAgendaSlotService);
    repository = module.get(PlaceholderAgendaSlotRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return placeholder slot when found', async () => {
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);

      const result = await service.getAsync(mockPlaceholderSlot.id);

      expect(result).toEqual(mockPlaceholderSlot);
      expect(repository.getAsync).toHaveBeenCalledWith(mockPlaceholderSlot.id);
    });

    it('should return null when placeholder slot not found', async () => {
      repository.getAsync.mockResolvedValue(null);

      const result = await service.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all placeholder slots', async () => {
      repository.browseAsync.mockResolvedValue(mockPlaceholderSlots);

      const result = await service.browseAsync();

      expect(result).toEqual(mockPlaceholderSlots);
      expect(repository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no placeholder slots exist', async () => {
      repository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: CreatePlaceholderAgendaSlotDto = {
      from: '2024-01-15T09:00:00Z',
      to: '2024-01-15T09:30:00Z',
      trackId: '123e4567-e89b-12d3-a456-426614174001',
      placeholder: 'Coffee Break',
    };

    it('should add placeholder slot successfully', async () => {
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(repository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should add placeholder slot without placeholder text', async () => {
      const dtoWithoutPlaceholder: CreatePlaceholderAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:30:00Z',
        trackId: '123e4567-e89b-12d3-a456-426614174001',
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithoutPlaceholder);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithoutPlaceholder);
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: CreatePlaceholderAgendaSlotDto = {
        from: '2024-01-15T11:00:00Z',
        to: '2024-01-15T09:00:00Z',
        trackId: '123e4567-e89b-12d3-a456-426614174001',
      };

      await expect(service.addAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const dtoWithSameDates: CreatePlaceholderAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:00:00Z',
        trackId: '123e4567-e89b-12d3-a456-426614174001',
      };

      await expect(service.addAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdatePlaceholderAgendaSlotDto = {
      id: mockPlaceholderSlot.id,
      from: '2024-01-15T08:30:00Z',
      to: '2024-01-15T09:00:00Z',
      placeholder: 'Updated Break',
    };

    it('should update placeholder slot successfully', async () => {
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(repository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(repository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw NotFoundException when placeholder slot does not exist', async () => {
      repository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateAsync(updateDto)).rejects.toThrow(
        `Placeholder agenda slot ${updateDto.id} not found.`,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        from: '2024-01-15T12:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);

      await expect(service.updateAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const dtoWithSameDates: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);

      await expect(service.updateAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should update only from date using existing to date', async () => {
      const dtoWithOnlyFrom: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        from: '2024-01-15T08:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyFrom);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyFrom);
    });

    it('should update only to date using existing from date', async () => {
      const dtoWithOnlyTo: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        to: '2024-01-15T10:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyTo);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyTo);
    });

    it('should throw WrongDatesException when only updating from date to be after existing to date', async () => {
      const dtoWithInvalidFrom: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        from: '2024-01-15T10:00:00Z', // existing to is 09:30
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);

      await expect(service.updateAsync(dtoWithInvalidFrom)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when only updating to date to be before existing from date', async () => {
      const dtoWithInvalidTo: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        to: '2024-01-15T08:00:00Z', // existing from is 09:00
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);

      await expect(service.updateAsync(dtoWithInvalidTo)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow updating only placeholder text', async () => {
      const dtoWithOnlyPlaceholder: UpdatePlaceholderAgendaSlotDto = {
        id: mockPlaceholderSlot.id,
        placeholder: 'New Placeholder Text',
      };
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyPlaceholder);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyPlaceholder);
    });
  });

  describe('deleteAsync', () => {
    it('should delete placeholder slot successfully', async () => {
      repository.getAsync.mockResolvedValue(mockPlaceholderSlot);
      repository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockPlaceholderSlot.id);

      expect(repository.getAsync).toHaveBeenCalledWith(mockPlaceholderSlot.id);
      expect(repository.deleteAsync).toHaveBeenCalledWith(mockPlaceholderSlot.id);
    });

    it('should throw NotFoundException when placeholder slot does not exist', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteAsync(id)).rejects.toThrow(
        `Placeholder agenda slot ${id} not found.`,
      );
      expect(repository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
