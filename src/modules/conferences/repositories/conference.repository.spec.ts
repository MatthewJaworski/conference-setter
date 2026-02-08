import { DataSource } from 'typeorm';
import { ConferencesRepository } from './conference.repository';
import { ConferenceEntity } from '../entities/conference.entity';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

/**
 * Tests verify ConferencesRepository's logic:
 * - UUID generation for new conferences
 * - Query building with correct where clauses and relations
 * - Entity-to-DTO mapping
 */
describe('ConferencesRepository', () => {
  let repository: ConferencesRepository;

  const existingEntity: ConferenceEntity = {
    id: 'existing-uuid-123',
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

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new ConferencesRepository(mockDataSource);

    jest.spyOn(repository, 'create').mockImplementation((data) => data as ConferenceEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as ConferenceEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    it('should generate UUID for new conference', async () => {
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
          name: 'New Conference',
          location: 'Berlin',
          hostId: 'host-uuid-123',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('getAsync', () => {
    it('should query by id with host relation', async () => {
      await repository.getAsync('existing-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
        relations: ['host'],
      });
    });

    it('should map entity to DTO when found', async () => {
      const result = await repository.getAsync('existing-uuid-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('existing-uuid-123');
      expect(result?.name).toBe('Tech Conference 2026');
    });

    it('should return null when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all conferences', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should map all entities to DTOs', async () => {
      const multipleEntities = [
        existingEntity,
        { ...existingEntity, id: 'second-id', name: 'Another Conference' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no conferences exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: ConferenceUpdateDto = {
      id: 'existing-uuid-123',
      name: 'Updated Conference Name',
      location: 'Prague',
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
          name: 'Updated Conference Name',
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
});
