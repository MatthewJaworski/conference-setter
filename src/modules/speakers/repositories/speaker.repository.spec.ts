import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { SpeakerRepository } from './speaker.repository';
import { SpeakerEntity } from '../entities/speaker.entity';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('SpeakerRepository', () => {
  let repository: SpeakerRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockSpeakerEntity: SpeakerEntity = {
    id: 'test-uuid-123',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Expert speaker',
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
        SpeakerRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<SpeakerRepository>(SpeakerRepository);

    jest.spyOn(repository, 'create').mockImplementation((entity) => entity as SpeakerEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockSpeakerEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockSpeakerEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockSpeakerEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as SpeakerEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: CreateSpeakerDto = {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      bio: 'New speaker',
    };

    it('should add speaker with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create speaker with correct id', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
        }),
      );
    });
  });

  describe('getAsync', () => {
    it('should return speaker DTO when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
    });

    it('should return null when speaker not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all speakers as DTOs', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no speakers exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateSpeakerDto = {
      id: 'test-uuid-123',
      fullName: 'Updated Name',
    };

    it('should update speaker when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not update when speaker not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete speaker by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });

  describe('getByEmailAsync', () => {
    it('should return speaker DTO when found by email', async () => {
      const result = await repository.getByEmailAsync('john.doe@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
      expect(result).toBeDefined();
      expect(result?.email).toBe('john.doe@example.com');
    });

    it('should return null when speaker not found by email', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getByEmailAsync('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
