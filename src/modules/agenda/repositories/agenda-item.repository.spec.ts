import { DataSource } from 'typeorm';
import { AgendaItemRepository } from './agenda-item.repository';
import { AgendaItemEntity } from '../entities/agenda-item.entity';
import { CreateAgendaItemDto } from '../dtos/create-agenda-item.dto';
import { UpdateAgendaItemDto } from '../dtos/update-agenda-item.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

describe('AgendaItemRepository', () => {
  let repository: AgendaItemRepository;

  const existingEntity: AgendaItemEntity = {
    id: 'existing-uuid-123',
    conferenceId: 'conference-uuid-123',
    title: 'Opening Keynote',
    description: 'An introduction to the conference',
    level: 2,
    tags: ['keynote', 'opening'],
    speakerIds: ['speaker-1', 'speaker-2'],
    version: 0,
  };

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new AgendaItemRepository(mockDataSource);

    jest.spyOn(repository, 'create').mockImplementation((data) => data as AgendaItemEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as AgendaItemEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    it('should generate UUID for new item', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'generated-uuid-123',
        }),
      );
    });

    it('should set version to 0 for new item', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 0,
        }),
      );
    });

    it('should map all DTO fields to entity', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Agenda Item',
          description: 'Description',
          level: 3,
          conferenceId: 'conference-uuid-123',
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
      expect(result?.title).toBe('Opening Keynote');
      expect(result?.level).toBe(2);
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
        { ...existingEntity, id: 'second-id', title: 'Workshop' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Opening Keynote');
      expect(result[1].title).toBe('Workshop');
    });

    it('should return empty array when no items exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaItemDto = {
      id: 'existing-uuid-123',
      title: 'Updated Title',
      level: 4,
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
          title: 'Updated Title',
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
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
