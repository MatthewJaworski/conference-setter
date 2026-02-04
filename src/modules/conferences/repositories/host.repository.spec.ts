import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { HostsRepository } from './host.repository';
import { HostEntity } from '../entities/host.entity';
import { HostCreateDto } from '../dtos/host-create.dto';
import { HostDetailsDto } from '../dtos/host-detials.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('HostsRepository', () => {
  let repository: HostsRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockHostEntity: HostEntity = {
    id: 'test-uuid-123',
    name: 'Tech Corp',
    description: 'Technology company',
    conferences: [],
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
        HostsRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<HostsRepository>(HostsRepository);

    jest.spyOn(repository, 'create').mockImplementation((entity) => entity as HostEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockHostEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockHostEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockHostEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as HostEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: HostCreateDto = {
      name: 'New Host',
      description: 'New host description',
    };

    it('should add host with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create host with correct id', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
        }),
      );
    });
  });

  describe('getAsync', () => {
    it('should return host DTO when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
        relations: ['conferences'],
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
    });

    it('should return null when host not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all hosts as DTOs', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalledWith({ relations: ['conferences'] });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no hosts exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: HostDetailsDto = {
      id: 'test-uuid-123',
      name: 'Updated Host Name',
      description: 'Updated description',
      conferences: [],
    };

    it('should update host when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not update when host not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete host by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
