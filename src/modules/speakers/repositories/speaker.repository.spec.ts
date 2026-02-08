import { DataSource } from 'typeorm';
import { SpeakerRepository } from './speaker.repository';
import { SpeakerEntity } from '../entities/speaker.entity';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

/**
 * Tests verify SpeakerRepository's logic:
 * - UUID generation for new speakers
 * - Query building with correct where clauses
 * - Entity-to-DTO mapping
 * - getByEmailAsync query logic
 */
describe('SpeakerRepository', () => {
  let repository: SpeakerRepository;

  const existingEntity: SpeakerEntity = {
    id: 'existing-uuid-123',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Expert speaker',
  };

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new SpeakerRepository(mockDataSource);

    jest.spyOn(repository, 'create').mockImplementation((data) => data as SpeakerEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as SpeakerEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAsync', () => {
    const createDto: CreateSpeakerDto = {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      bio: 'New speaker',
    };

    it('should generate UUID for new speaker', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'generated-uuid-123',
        }),
      );
    });

    it('should map all DTO fields to entity', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          bio: 'New speaker',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('getAsync', () => {
    it('should query by id with correct where clause', async () => {
      await repository.getAsync('existing-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
      });
    });

    it('should map entity to DTO when found', async () => {
      const result = await repository.getAsync('existing-uuid-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('existing-uuid-123');
      expect(result?.fullName).toBe('John Doe');
    });

    it('should return null when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all speakers', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should map all entities to DTOs', async () => {
      const multipleEntities = [
        existingEntity,
        { ...existingEntity, id: 'second-id', fullName: 'Jane Smith' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
      expect(result[0].fullName).toBe('John Doe');
      expect(result[1].fullName).toBe('Jane Smith');
    });

    it('should return empty array when no speakers exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateSpeakerDto = {
      id: 'existing-uuid-123',
      fullName: 'Updated Name',
    };

    it('should query for existing entity before updating', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
      });
    });

    it('should merge update data with existing entity', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.merge).toHaveBeenCalledWith(
        existingEntity,
        expect.objectContaining({
          fullName: 'Updated Name',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not save when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete by id', async () => {
      await repository.deleteAsync('existing-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('existing-uuid-123');
    });
  });

  describe('getByEmailAsync', () => {
    it('should query by email with correct where clause', async () => {
      await repository.getByEmailAsync('john.doe@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
    });

    it('should map entity to DTO when found by email', async () => {
      const result = await repository.getByEmailAsync('john.doe@example.com');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('john.doe@example.com');
      expect(result?.fullName).toBe('John Doe');
    });

    it('should return null when speaker not found by email', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getByEmailAsync('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
