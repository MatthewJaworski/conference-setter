import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegularAgendaSlotService } from './regular-agenda-slot.service';
import { RegularAgendaSlotRepository } from '../repositories/regular-agenda-slot.repository';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { RegularAgendaSlotDto } from '../dtos/regular-agenda-slot.dto';
import { CreateRegularAgendaSlotDto } from '../dtos/create-regular-agenda-slot.dto';
import { UpdateRegularAgendaSlotDto } from '../dtos/update-regular-agenda-slot.dto';

describe('RegularAgendaSlotService', () => {
  let service: RegularAgendaSlotService;
  let repository: jest.Mocked<RegularAgendaSlotRepository>;

  const mockRegularSlot: RegularAgendaSlotDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T10:00:00Z'),
    trackId: '123e4567-e89b-12d3-a456-426614174001',
    participantsLimit: 50,
    agendaItemId: '123e4567-e89b-12d3-a456-426614174002',
  };

  const mockRegularSlots: RegularAgendaSlotDto[] = [
    mockRegularSlot,
    {
      id: '123e4567-e89b-12d3-a456-426614174003',
      from: new Date('2024-01-15T10:00:00Z'),
      to: new Date('2024-01-15T11:00:00Z'),
      trackId: '123e4567-e89b-12d3-a456-426614174001',
      participantsLimit: 100,
      agendaItemId: undefined,
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
        RegularAgendaSlotService,
        {
          provide: RegularAgendaSlotRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RegularAgendaSlotService>(RegularAgendaSlotService);
    repository = module.get(RegularAgendaSlotRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return regular slot when found', async () => {
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      const result = await service.getAsync(mockRegularSlot.id);

      expect(result).toEqual(mockRegularSlot);
      expect(repository.getAsync).toHaveBeenCalledWith(mockRegularSlot.id);
    });

    it('should return null when regular slot not found', async () => {
      repository.getAsync.mockResolvedValue(null);

      const result = await service.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all regular slots', async () => {
      repository.browseAsync.mockResolvedValue(mockRegularSlots);

      const result = await service.browseAsync();

      expect(result).toEqual(mockRegularSlots);
      expect(repository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no regular slots exist', async () => {
      repository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: CreateRegularAgendaSlotDto = {
      from: '2024-01-15T09:00:00Z',
      to: '2024-01-15T10:00:00Z',
      trackId: '123e4567-e89b-12d3-a456-426614174001',
      participantsLimit: 50,
    };

    it('should add regular slot successfully', async () => {
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(repository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should add regular slot without participantsLimit', async () => {
      const dtoWithoutLimit: CreateRegularAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T10:00:00Z',
        trackId: '123e4567-e89b-12d3-a456-426614174001',
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithoutLimit);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithoutLimit);
    });

    it('should add regular slot with agendaItemId', async () => {
      const dtoWithAgendaItem: CreateRegularAgendaSlotDto = {
        ...createDto,
        agendaItemId: '123e4567-e89b-12d3-a456-426614174002',
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithAgendaItem);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithAgendaItem);
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: CreateRegularAgendaSlotDto = {
        from: '2024-01-15T11:00:00Z',
        to: '2024-01-15T09:00:00Z',
        trackId: '123e4567-e89b-12d3-a456-426614174001',
      };

      await expect(service.addAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const dtoWithSameDates: CreateRegularAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:00:00Z',
        trackId: '123e4567-e89b-12d3-a456-426614174001',
      };

      await expect(service.addAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when participantsLimit is less than 1', async () => {
      const dtoWithInvalidLimit: CreateRegularAgendaSlotDto = {
        ...createDto,
        participantsLimit: 0,
      };

      await expect(service.addAsync(dtoWithInvalidLimit)).rejects.toThrow(
        'Participants limit must be at least 1.',
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when participantsLimit is negative', async () => {
      const dtoWithNegativeLimit: CreateRegularAgendaSlotDto = {
        ...createDto,
        participantsLimit: -5,
      };

      await expect(service.addAsync(dtoWithNegativeLimit)).rejects.toThrow(
        'Participants limit must be at least 1.',
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should accept participantsLimit equal to 1', async () => {
      const dtoWithMinLimit: CreateRegularAgendaSlotDto = {
        ...createDto,
        participantsLimit: 1,
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithMinLimit);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithMinLimit);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateRegularAgendaSlotDto = {
      id: mockRegularSlot.id,
      from: '2024-01-15T08:00:00Z',
      to: '2024-01-15T09:30:00Z',
      participantsLimit: 75,
    };

    it('should update regular slot successfully', async () => {
      repository.getAsync.mockResolvedValue(mockRegularSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(repository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(repository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw NotFoundException when regular slot does not exist', async () => {
      repository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateAsync(updateDto)).rejects.toThrow(
        `Regular agenda slot ${updateDto.id} not found.`,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        from: '2024-01-15T12:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      await expect(service.updateAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const dtoWithSameDates: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      await expect(service.updateAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should update only from date using existing to date', async () => {
      const dtoWithOnlyFrom: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        from: '2024-01-15T08:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyFrom);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyFrom);
    });

    it('should update only to date using existing from date', async () => {
      const dtoWithOnlyTo: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        to: '2024-01-15T11:00:00Z',
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyTo);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyTo);
    });

    it('should throw WrongDatesException when only updating from date to be after existing to date', async () => {
      const dtoWithInvalidFrom: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        from: '2024-01-15T11:00:00Z', // existing to is 10:00
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      await expect(service.updateAsync(dtoWithInvalidFrom)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when only updating to date to be before existing from date', async () => {
      const dtoWithInvalidTo: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        to: '2024-01-15T08:00:00Z', // existing from is 09:00
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      await expect(service.updateAsync(dtoWithInvalidTo)).rejects.toThrow(WrongDatesException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when participantsLimit is less than 1', async () => {
      const dtoWithInvalidLimit: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        participantsLimit: 0,
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      await expect(service.updateAsync(dtoWithInvalidLimit)).rejects.toThrow(
        'Participants limit must be at least 1.',
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when participantsLimit is negative', async () => {
      const dtoWithNegativeLimit: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        participantsLimit: -10,
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);

      await expect(service.updateAsync(dtoWithNegativeLimit)).rejects.toThrow(
        'Participants limit must be at least 1.',
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow updating only participantsLimit', async () => {
      const dtoWithOnlyLimit: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        participantsLimit: 200,
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyLimit);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyLimit);
    });

    it('should allow updating only agendaItemId', async () => {
      const dtoWithOnlyAgendaItem: UpdateRegularAgendaSlotDto = {
        id: mockRegularSlot.id,
        agendaItemId: '123e4567-e89b-12d3-a456-426614174999',
      };
      repository.getAsync.mockResolvedValue(mockRegularSlot);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyAgendaItem);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyAgendaItem);
    });
  });

  describe('deleteAsync', () => {
    it('should delete regular slot successfully', async () => {
      repository.getAsync.mockResolvedValue(mockRegularSlot);
      repository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockRegularSlot.id);

      expect(repository.getAsync).toHaveBeenCalledWith(mockRegularSlot.id);
      expect(repository.deleteAsync).toHaveBeenCalledWith(mockRegularSlot.id);
    });

    it('should throw NotFoundException when regular slot does not exist', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteAsync(id)).rejects.toThrow(`Regular agenda slot ${id} not found.`);
      expect(repository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
