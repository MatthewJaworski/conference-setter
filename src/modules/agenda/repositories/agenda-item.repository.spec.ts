import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { AgendaItemRepository } from './agenda-item.repository';
import { AgendaItemEntity } from '../entities/agenda-item.entity';
import { CreateAgendaItemDto } from '../dtos/create-agenda-item.dto';
import { UpdateAgendaItemDto } from '../dtos/update-agenda-item.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('AgendaItemRepository', () => {
  let repository: AgendaItemRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockAgendaItemEntity: AgendaItemEntity = {
    id: 'test-uuid-123',
    conferenceId: 'conference-uuid-123',
    title: 'Opening Keynote',
    description: 'An introduction to the conference',
    level: 2,
    tags: ['keynote', 'opening'],
    speakerIds: ['speaker-1', 'speaker-2'],
    version: 0,
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
        AgendaItemRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<AgendaItemRepository>(AgendaItemRepository);

    // Mock repository methods
    jest.spyOn(repository, 'create').mockImplementation((entity) => entity as AgendaItemEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockAgendaItemEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgendaItemEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockAgendaItemEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as AgendaItemEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaItemDto = {
      conferenceId: 'conference-uuid-123',
      title: 'New Agenda Item',
      description: 'Description',
      level: 3,
      tags: ['test'],
      speakerIds: ['speaker-1'],
    };

    it('should add agenda item with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should set version to 0 for new item', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 0,
        }),
      );
    });
  });

  describe('getAsync', () => {
    it('should return agenda item when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
    });

    it('should return null when agenda item not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all agenda items', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no items exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaItemDto = {
      id: 'test-uuid-123',
      title: 'Updated Title',
      level: 4,
    };

    it('should update agenda item when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should increment version on update', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
        }),
      );
    });

    it('should not update when agenda item not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete agenda item by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
