import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { AgendaSlotRepository } from './agenda-slot.repository';
import { AgendaSlotEntity } from '../entities/agenda-slot.entity';
import { CreateAgendaSlotDto } from '../dtos/create-agenda-slot.dto';
import { UpdateAgendaSlotDto } from '../dtos/update-agenda-slot.dto';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('AgendaSlotRepository', () => {
  let repository: AgendaSlotRepository;
  let mockEntityManager: Partial<EntityManager>;
  let mockDataSource: Partial<DataSource>;

  const mockAgendaSlotEntity: AgendaSlotEntity = {
    id: 'test-uuid-123',
    from: new Date('2024-01-15T09:00:00Z'),
    to: new Date('2024-01-15T10:00:00Z'),
    trackId: 'track-uuid-123',
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
        AgendaSlotRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<AgendaSlotRepository>(AgendaSlotRepository);

    jest.spyOn(repository, 'create').mockImplementation((entity) => entity as AgendaSlotEntity);
    jest.spyOn(repository, 'save').mockResolvedValue(mockAgendaSlotEntity);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgendaSlotEntity);
    jest.spyOn(repository, 'find').mockResolvedValue([mockAgendaSlotEntity]);
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });
    jest.spyOn(repository, 'merge').mockImplementation(
      (entity, data) =>
        ({
          ...entity,
          ...data,
        }) as AgendaSlotEntity,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaSlotDto = {
      from: '2024-01-15T09:00:00Z',
      to: '2024-01-15T10:00:00Z',
      trackId: 'track-uuid-123',
    };

    it('should add agenda slot with generated UUID', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create slot with correct id', async () => {
      await repository.addAsync(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
        }),
      );
    });
  });

  describe('getAsync', () => {
    it('should return agenda slot when found', async () => {
      const result = await repository.getAsync('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-uuid-123');
    });

    it('should return null when agenda slot not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all agenda slots', async () => {
      const result = await repository.browseAsync();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no slots exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await repository.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaSlotDto = {
      id: 'test-uuid-123',
      from: '2024-01-15T08:00:00Z',
      to: '2024-01-15T09:30:00Z',
    };

    it('should update agenda slot when exists', async () => {
      await repository.updateAsync(updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.id },
      });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should not update when agenda slot not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await repository.updateAsync(updateDto);

      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsync', () => {
    it('should delete agenda slot by id', async () => {
      await repository.deleteAsync('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
