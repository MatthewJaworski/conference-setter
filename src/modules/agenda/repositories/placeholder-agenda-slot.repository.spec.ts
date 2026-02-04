import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { PlaceholderAgendaSlotRepository } from './placeholder-agenda-slot.repository';
import { PlaceholderAgendaSlotEntity } from '../entities/placeholder-agenda-slot.entity';
import { CreatePlaceholderAgendaSlotDto } from '../dtos/create-placeholder-agenda-slot.dto';
import { UpdatePlaceholderAgendaSlotDto } from '../dtos/update-placeholder-agenda-slot.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('PlaceholderAgendaSlotRepository', () => {
  let repository: PlaceholderAgendaSlotRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockPlaceholderSlotEntity: PlaceholderAgendaSlotEntity = {
    id: 'test-uuid-123',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T09:30:00Z'),
    trackId: 'track-uuid-123',
    placeholder: 'Coffee Break',
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
        PlaceholderAgendaSlotRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<PlaceholderAgendaSlotRepository>(PlaceholderAgendaSlotRepository);

    jest
      .spyOn(repository, 'create')
      .mockImplementation((entity) => entity as PlaceholderAgendaSlotEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockPlaceholderSlotEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlaceholderSlotEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockPlaceholderSlotEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as PlaceholderAgendaSlotEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: CreatePlaceholderAgendaSlotDto = {
      from: '2024-01-15T09:00:00Z',
      to: '2024-01-15T09:30:00Z',
      trackId: 'track-uuid-123',
      placeholder: 'Coffee Break',
    };

    it('should add placeholder slot with generated UUID', async () => {
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

    it('should add placeholder slot without placeholder text', async () => {
      const dtoWithoutPlaceholder: CreatePlaceholderAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:30:00Z',
        trackId: 'track-uuid-123',
      };

      await repository.addAsync(dtoWithoutPlaceholder);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('getAsync', () => {
    it('should return placeholder slot when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
      expect(result?.placeholder).toBe('Coffee Break');
    });

    it('should return null when placeholder slot not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all placeholder slots', async () => {
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
    const updateDto: UpdatePlaceholderAgendaSlotDto = {
      id: 'test-uuid-123',
      placeholder: 'Lunch Break',
    };

    it('should update placeholder slot when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not update when placeholder slot not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should update time fields', async () => {
      const updateDtoWithTime: UpdatePlaceholderAgendaSlotDto = {
        id: 'test-uuid-123',
        from: '2024-01-15T08:30:00Z',
        to: '2024-01-15T09:00:00Z',
      };

      await repository.updateAsync(updateDtoWithTime);

      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete placeholder slot by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
