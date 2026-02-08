import { DataSource } from 'typeorm';
import { RegularAgendaSlotRepository } from './regular-agenda-slot.repository';
import { RegularAgendaSlotEntity } from '../entities/regular-agenda-slot.entity';
import { CreateRegularAgendaSlotDto } from '../dtos/create-regular-agenda-slot.dto';
import { UpdateRegularAgendaSlotDto } from '../dtos/update-regular-agenda-slot.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid-123'),
}));

describe('RegularAgendaSlotRepository', () => {
  let repository: RegularAgendaSlotRepository;

  const existingEntity: RegularAgendaSlotEntity = {
    id: 'existing-uuid-123',
    from: new Date('2024-01-15T10:00:00Z'),
    to: new Date('2024-01-15T11:00:00Z'),
    trackId: 'track-uuid-123',
    participantsLimit: 50,
    agendaItemId: 'agenda-item-uuid-123',
  };

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new RegularAgendaSlotRepository(mockDataSource);

    jest.spyOn(repository, 'create').mockImplementation((data) => data as RegularAgendaSlotEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([existingEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation((entity, ...sources) => {
      return Object.assign({}, entity, ...sources) as RegularAgendaSlotEntity;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addAsync', () => {
    const createDto: CreateRegularAgendaSlotDto = {
      from: '2024-01-15T10:00:00Z',
      to: '2024-01-15T11:00:00Z',
      trackId: 'track-uuid-123',
      participantsLimit: 50,
      agendaItemId: 'agenda-item-uuid-123',
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
          participantsLimit: 50,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('should handle slot without optional fields', async () => {
      const dtoWithoutOptional: CreateRegularAgendaSlotDto = {
        from: '2024-01-15T10:00:00Z',
        to: '2024-01-15T11:00:00Z',
        trackId: 'track-uuid-123',
      };

      await repository.addAsync(dtoWithoutOptional);

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
      expect(result?.participantsLimit).toBe(50);
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
        { ...existingEntity, id: 'second-id', participantsLimit: 100 },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(multipleEntities);

      const result = await repository.browseAsync();

      expect(result).toHaveLength(2);
      expect(result[0].participantsLimit).toBe(50);
      expect(result[1].participantsLimit).toBe(100);
    });

    it('should return empty array when no slots exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateRegularAgendaSlotDto = {
      id: 'existing-uuid-123',
      participantsLimit: 100,
    };

    it('should query for existing entity before updating', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-uuid-123' },
      });
    });

    it('should merge update data with existing entity', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not save when entity not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should update agendaItemId', async () => {
      const updateDtoWithAgendaItem: UpdateRegularAgendaSlotDto = {
        id: 'existing-uuid-123',
        agendaItemId: 'new-agenda-item-uuid',
      };

      await repository.updateAsync(updateDtoWithAgendaItem);

      expect(repository.merge).toHaveBeenCalledWith(
        existingEntity,
        expect.objectContaining({
          agendaItemId: 'new-agenda-item-uuid',
        }),
      );
    });

    it('should update time fields', async () => {
      const updateDtoWithTime: UpdateRegularAgendaSlotDto = {
        id: 'existing-uuid-123',
        from: '2024-01-15T09:00:00Z',
        to: '2024-01-15T10:30:00Z',
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
