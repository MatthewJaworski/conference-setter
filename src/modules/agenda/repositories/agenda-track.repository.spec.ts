import { DataSource } from 'typeorm';
import { AgendaTrackRepository } from './agenda-track.repository';
import { AgendaTrackEntity } from '../entities/agenda-track.entity';
import { CreateAgendaTrackDto } from '../dtos/create-agenda-track.dto';
import { UpdateAgendaTrackDto } from '../dtos/update-agenda-track.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

/**
 * These tests verify AgendaTrackRepository's logic:
 * - UUID generation, version management
 * - Query building, entity-to-DTO mapping
 * - existsAsync logic
 */
describe('AgendaTrackRepository', () => {
  let repository: AgendaTrackRepository;

  const existingEntity: AgendaTrackEntity = {
    id: 'existing-uuid-123',
    conferenceId: 'conference-uuid-123',
    name: 'Main Hall',
    version: 0,
  };

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new AgendaTrackRepository(mockDataSource);

    jest.spyOn(repository, 'create').mockImplementation((data) => data as AgendaTrackEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as AgendaTrackEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaTrackDto = {
      conferenceId: 'conference-uuid-123',
      name: 'New Track',
    };

    it('should generate UUID for new track', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'generated-uuid-123',
        }),
      );
    });

    it('should set version to 0 for new track', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 0,
        }),
      );
    });

    it('should map DTO fields to entity', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Track',
          conferenceId: 'conference-uuid-123',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('existsAsync', () => {
    it('should return true when count > 0', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      const result = await repository.existsAsync('existing-uuid-123');

      expect(repository.count).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
      });
      expect(result).toBe(true);
    });

    it('should return false when count is 0', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(0);

      const result = await repository.existsAsync('non-existent-id');

      expect(result).toBe(false);
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
      expect(result?.name).toBe('Main Hall');
    });

    it('should return null when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should query without filter when no conferenceId provided', async () => {
      await repository.browseAsync();

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
      });
    });

    it('should filter by conferenceId when provided', async () => {
      await repository.browseAsync('conference-uuid-123');

      expect(repository.find).toHaveBeenCalledWith({
        where: { conferenceId: 'conference-uuid-123' },
      });
    });

    it('should map all entities to DTOs', async () => {
      const multipleEntities = [
        existingEntity,
        { ...existingEntity, id: 'second-id', name: 'Room B' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Main Hall');
      expect(result[1].name).toBe('Room B');
    });

    it('should return empty array when no tracks exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaTrackDto = {
      id: 'existing-uuid-123',
      name: 'Updated Track Name',
    };

    it('should query for existing entity before updating', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
      });
    });

    it('should increment version on update', async () => {
      const entityWithVersion5 = { ...existingEntity, version: 5 };
      jest.spyOn(repository, 'findOne').mockResolvedValue(entityWithVersion5);

      await repository.updateAsync(updateDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 6,
        }),
      );
    });

    it('should merge update data with existing entity', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.merge).toHaveBeenCalledWith(
        existingEntity,
        expect.objectContaining({
          name: 'Updated Track Name',
        }),
      );
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
