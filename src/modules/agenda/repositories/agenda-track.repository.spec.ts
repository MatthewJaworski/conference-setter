import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { AgendaTrackRepository } from './agenda-track.repository';
import { AgendaTrackEntity } from '../entities/agenda-track.entity';
import { CreateAgendaTrackDto } from '../dtos/create-agenda-track.dto';
import { UpdateAgendaTrackDto } from '../dtos/update-agenda-track.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('AgendaTrackRepository', () => {
  let repository: AgendaTrackRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockAgendaTrackEntity: AgendaTrackEntity = {
    id: 'test-uuid-123',
    conferenceId: 'conference-uuid-123',
    name: 'Main Hall',
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
      count: jest.fn(),
    };

    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaTrackRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<AgendaTrackRepository>(AgendaTrackRepository);

    jest.spyOn(repository, 'create').mockImplementation((entity) => entity as AgendaTrackEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockAgendaTrackEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgendaTrackEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockAgendaTrackEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as AgendaTrackEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaTrackDto = {
      conferenceId: 'conference-uuid-123',
      name: 'New Track',
    };

    it('should add agenda track with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should set version to 0 for new track', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 0,
        }),
      );
    });
  });

  describe('existsAsync', () => {
    it('should return true when track exists', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      const result = await repository.existsAsync('test-uuid-123');

      expect(repository.count).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBe(true);
    });

    it('should return false when track does not exist', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(0);

      const result = await repository.existsAsync('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getAsync', () => {
    it('should return agenda track when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
    });

    it('should return null when agenda track not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all agenda tracks', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no tracks exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaTrackDto = {
      id: 'test-uuid-123',
      name: 'Updated Track Name',
    };

    it('should update agenda track when exists', async () => {
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

    it('should not update when agenda track not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete agenda track by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
