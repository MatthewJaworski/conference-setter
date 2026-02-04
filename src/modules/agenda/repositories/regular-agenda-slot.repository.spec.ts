import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { RegularAgendaSlotRepository } from './regular-agenda-slot.repository';
import { RegularAgendaSlotEntity } from '../entities/regular-agenda-slot.entity';
import { CreateRegularAgendaSlotDto } from '../dtos/create-regular-agenda-slot.dto';
import { UpdateRegularAgendaSlotDto } from '../dtos/update-regular-agenda-slot.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('RegularAgendaSlotRepository', () => {
  let repository: RegularAgendaSlotRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockRegularSlotEntity: RegularAgendaSlotEntity = {
    id: 'test-uuid-123',
    from: new Date('2024-01-15T10:00:00Z'),
    to: new Date('2024-01-15T11:00:00Z'),
    trackId: 'track-uuid-123',
    participantsLimit: 50,
    agendaItemId: 'agenda-item-uuid-123',
  };

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
    };

    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegularAgendaSlotRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<RegularAgendaSlotRepository>(RegularAgendaSlotRepository);

    jest
      .spyOn(repository, 'create')
      .mockImplementation((entity) => entity as RegularAgendaSlotEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockRegularSlotEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockRegularSlotEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockRegularSlotEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as RegularAgendaSlotEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: CreateRegularAgendaSlotDto = {
      from: '2024-01-15T10:00:00Z',
      to: '2024-01-15T11:00:00Z',
      trackId: 'track-uuid-123',
      participantsLimit: 50,
      agendaItemId: 'agenda-item-uuid-123',
    };

    it('should add regular slot with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create slot with correct id', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
        }),
      );
    });

    it('should add regular slot without optional fields', async () => {
      const dtoWithoutOptional: CreateRegularAgendaSlotDto = {
        from: '2024-01-15T10:00:00Z',
        to: '2024-01-15T11:00:00Z',
        trackId: 'track-uuid-123',
      };

      await repository.addAsync(dtoWithoutOptional);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('getAsync', () => {
    it('should return regular slot when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
      expect(result?.participantsLimit).toBe(50);
    });

    it('should return null when regular slot not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all regular slots', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no slots exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateRegularAgendaSlotDto = {
      id: 'test-uuid-123',
      participantsLimit: 100,
    };

    it('should update regular slot when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not update when regular slot not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should update agendaItemId', async () => {
      const updateDtoWithAgendaItem: UpdateRegularAgendaSlotDto = {
        id: 'test-uuid-123',
        agendaItemId: 'new-agenda-item-uuid',
      };

      await repository.updateAsync(updateDtoWithAgendaItem);

      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update time fields', async () => {
      const updateDtoWithTime: UpdateRegularAgendaSlotDto = {
        id: 'test-uuid-123',
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T10:30:00Z',
      };

      await repository.updateAsync(updateDtoWithTime);

      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete regular slot by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
