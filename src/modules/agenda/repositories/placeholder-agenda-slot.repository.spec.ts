import { DataSource } from 'typeorm';
import { PlaceholderAgendaSlotRepository } from './placeholder-agenda-slot.repository';
import { PlaceholderAgendaSlotEntity } from '../entities/placeholder-agenda-slot.entity';
import { CreatePlaceholderAgendaSlotDto } from '../dtos/create-placeholder-agenda-slot.dto';
import { UpdatePlaceholderAgendaSlotDto } from '../dtos/update-placeholder-agenda-slot.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

/**
 * Tests verify PlaceholderAgendaSlotRepository's logic:
 * - UUID generation for new slots
 * - Query building, entity-to-DTO mapping
 * - Handling optional placeholder text
 */
describe('PlaceholderAgendaSlotRepository', () => {
  let repository: PlaceholderAgendaSlotRepository;

  const existingEntity: PlaceholderAgendaSlotEntity = {
    id: 'existing-uuid-123',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T09:30:00Z'),
    trackId: 'track-uuid-123',
    placeholder: 'Coffee Break',
  };

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new PlaceholderAgendaSlotRepository(mockDataSource);

    jest
      .spyOn(repository, 'create')
      .mockImplementation((data) => data as PlaceholderAgendaSlotEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as PlaceholderAgendaSlotEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAsync', () => {
    const createDto: CreatePlaceholderAgendaSlotDto = {
      from: '2024-01-15T09:00:00Z',
      to: '2024-01-15T09:30:00Z',
      trackId: 'track-uuid-123',
      placeholder: 'Coffee Break',
    };

    it('should generate UUID for new slot', async () => {
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
          trackId: 'track-uuid-123',
          placeholder: 'Coffee Break',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('should handle slot without placeholder text', async () => {
      const dtoWithoutPlaceholder: CreatePlaceholderAgendaSlotDto = {
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T09:30:00Z',
        trackId: 'track-uuid-123',
      };

      await repository.addAsync(dtoWithoutPlaceholder);

      expect(repository.create).toHaveBeenCalled();
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
      expect(result?.placeholder).toBe('Coffee Break');
    });

    it('should return null when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all slots', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should map all entities to DTOs', async () => {
      const multipleEntities = [
        existingEntity,
        { ...existingEntity, id: 'second-id', placeholder: 'Lunch Break' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
      expect(result[0].placeholder).toBe('Coffee Break');
      expect(result[1].placeholder).toBe('Lunch Break');
    });

    it('should return empty array when no slots exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdatePlaceholderAgendaSlotDto = {
      id: 'existing-uuid-123',
      placeholder: 'Lunch Break',
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
          placeholder: 'Lunch Break',
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

    it('should update time fields', async () => {
      const updateDtoWithTime: UpdatePlaceholderAgendaSlotDto = {
        id: 'existing-uuid-123',
        from: '2024-01-15T08:30:00Z',
        to: '2024-01-15T09:00:00Z',
      };

      await repository.updateAsync(updateDtoWithTime);

      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete by id', async () => {
      await repository.deleteAsync('existing-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('existing-uuid-123');
    });
  });
});
