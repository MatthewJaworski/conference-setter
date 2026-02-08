import { DataSource } from 'typeorm';
import { HostsRepository } from './host.repository';
import { HostEntity } from '../entities/host.entity';
import { HostCreateDto } from '../dtos/host-create.dto';
import { HostDetailsDto } from '../dtos/host-detials.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

/**
 * Tests verify HostsRepository's logic:
 * - UUID generation for new hosts
 * - Query building with correct where clauses and relations
 * - Entity-to-DTO mapping
 */
describe('HostsRepository', () => {
  let repository: HostsRepository;

  const existingEntity: HostEntity = {
    id: 'existing-uuid-123',
    name: 'Tech Corp',
    description: 'Technology company',
    conferences: [],
  };

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new HostsRepository(mockDataSource);

    jest.spyOn(repository, 'create').mockImplementation((data) => data as HostEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as HostEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAsync', () => {
    const createDto: HostCreateDto = {
      name: 'New Host',
      description: 'New host description',
    };

    it('should generate UUID for new host', async () => {
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
          name: 'New Host',
          description: 'New host description',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('getAsync', () => {
    it('should query by id with conferences relation', async () => {
      await repository.getAsync('existing-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
        relations: ['conferences'],
      });
    });

    it('should map entity to DTO when found', async () => {
      const result = await repository.getAsync('existing-uuid-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('existing-uuid-123');
      expect(result?.name).toBe('Tech Corp');
    });

    it('should return null when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should query with conferences relation', async () => {
      await repository.browseAsync();

      expect(repository.find).toHaveBeenCalledWith({ relations: ['conferences'] });
    });

    it('should map all entities to DTOs', async () => {
      const multipleEntities = [
        existingEntity,
        { ...existingEntity, id: 'second-id', name: 'Another Host' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Tech Corp');
      expect(result[1].name).toBe('Another Host');
    });

    it('should return empty array when no hosts exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: HostDetailsDto = {
      id: 'existing-uuid-123',
      name: 'Updated Host Name',
      description: 'Updated description',
      conferences: [],
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
          name: 'Updated Host Name',
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
