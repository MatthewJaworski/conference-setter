import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { ConferencesRepository } from './conference.repository';
import { ConferenceEntity } from '../entities/conference.entity';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('ConferencesRepository', () => {
  let repository: ConferencesRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockConferenceEntity: ConferenceEntity = {
    id: 'test-uuid-123',
    hostId: 'host-uuid-123',
    name: 'Tech Conference 2026',
    description: 'Annual technology conference',
    location: 'Warsaw, Poland',
    from: new Date('2026-06-15T09:00:00Z'),
    to: new Date('2026-06-17T18:00:00Z'),
    host: {
      id: 'host-uuid-123',
      name: 'Tech Corp',
      description: 'Technology company',
      conferences: [],
    },
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
        ConferencesRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<ConferencesRepository>(ConferencesRepository);

    jest.spyOn(repository, 'create').mockImplementation((entity) => entity as ConferenceEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockConferenceEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockConferenceEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockConferenceEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as ConferenceEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: ConferenceCreateDto = {
      hostId: 'host-uuid-123',
      name: 'New Conference',
      description: 'Description',
      location: 'Berlin',
      from: new Date('2026-07-01T09:00:00Z'),
      to: new Date('2026-07-03T18:00:00Z'),
    };

    it('should add conference with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create conference with correct id', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
        }),
      );
    });
  });

  describe('getAsync', () => {
    it('should return conference DTO when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
        relations: ['host'],
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
    });

    it('should return null when conference not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all conferences as DTOs', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no conferences exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: ConferenceUpdateDto = {
      id: 'test-uuid-123',
      name: 'Updated Conference Name',
      location: 'Prague',
    };

    it('should update conference when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not update when conference not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete conference by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
