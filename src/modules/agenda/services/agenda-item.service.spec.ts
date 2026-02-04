import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AgendaItemService } from './agenda-item.service';
import { AgendaItemRepository } from '../repositories/agenda-item.repository';
import { EmptyAgendaItemTitleException } from '@/shared/exceptions/empty-agenda-item-title.exception';
import { AgendaItemDto } from '../dtos/agenda-item.dto';
import { CreateAgendaItemDto } from '../dtos/create-agenda-item.dto';
import { UpdateAgendaItemDto } from '../dtos/update-agenda-item.dto';

describe('AgendaItemService', () => {
  let service: AgendaItemService;
  let repository: jest.Mocked<AgendaItemRepository>;

  const mockAgendaItem: AgendaItemDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    conferenceId: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Opening Keynote',
    description: 'An introduction to the conference',
    level: 2,
    tags: ['keynote', 'opening'],
    speakerIds: ['123e4567-e89b-12d3-a456-426614174002'],
    version: 0,
  };

  const mockAgendaItems: AgendaItemDto[] = [
    mockAgendaItem,
    {
      id: '123e4567-e89b-12d3-a456-426614174003',
      conferenceId: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Workshop: Advanced Topics',
      description: 'Deep dive into advanced concepts',
      level: 4,
      tags: ['workshop', 'advanced'],
      speakerIds: [],
      version: 0,
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaItemService,
        {
          provide: AgendaItemRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgendaItemService>(AgendaItemService);
    repository = module.get(AgendaItemRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return agenda item when found', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaItem);

      const result = await service.getAsync(mockAgendaItem.id);

      expect(result).toEqual(mockAgendaItem);
      expect(repository.getAsync).toHaveBeenCalledWith(mockAgendaItem.id);
    });

    it('should throw NotFoundException when agenda item not found', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.getAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.getAsync(id)).rejects.toThrow(`Agenda item with id ${id} not found`);
    });
  });

  describe('browseAsync', () => {
    it('should return all agenda items', async () => {
      repository.browseAsync.mockResolvedValue(mockAgendaItems);

      const result = await service.browseAsync();

      expect(result).toEqual(mockAgendaItems);
      expect(repository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no agenda items exist', async () => {
      repository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaItemDto = {
      conferenceId: '123e4567-e89b-12d3-a456-426614174001',
      title: 'New Agenda Item',
      description: 'Description of new item',
      level: 3,
      tags: ['new', 'test'],
      speakerIds: [],
    };

    it('should add agenda item successfully', async () => {
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(repository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should throw EmptyAgendaItemTitleException when title is empty', async () => {
      const dtoWithEmptyTitle: CreateAgendaItemDto = {
        ...createDto,
        title: '',
      };

      await expect(service.addAsync(dtoWithEmptyTitle)).rejects.toThrow(
        EmptyAgendaItemTitleException,
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw EmptyAgendaItemTitleException when title is only whitespace', async () => {
      const dtoWithWhitespaceTitle: CreateAgendaItemDto = {
        ...createDto,
        title: '   ',
      };

      await expect(service.addAsync(dtoWithWhitespaceTitle)).rejects.toThrow(
        EmptyAgendaItemTitleException,
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when level is less than 1', async () => {
      const dtoWithInvalidLevel: CreateAgendaItemDto = {
        ...createDto,
        level: 0,
      };

      await expect(service.addAsync(dtoWithInvalidLevel)).rejects.toThrow(
        'Level must be between 1 and 6.',
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when level is greater than 6', async () => {
      const dtoWithInvalidLevel: CreateAgendaItemDto = {
        ...createDto,
        level: 7,
      };

      await expect(service.addAsync(dtoWithInvalidLevel)).rejects.toThrow(
        'Level must be between 1 and 6.',
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should accept level equal to 1', async () => {
      const dtoWithMinLevel: CreateAgendaItemDto = {
        ...createDto,
        level: 1,
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithMinLevel);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithMinLevel);
    });

    it('should accept level equal to 6', async () => {
      const dtoWithMaxLevel: CreateAgendaItemDto = {
        ...createDto,
        level: 6,
      };
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithMaxLevel);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithMaxLevel);
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaItemDto = {
      id: mockAgendaItem.id,
      title: 'Updated Title',
      level: 3,
    };

    it('should update agenda item successfully', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaItem);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(repository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(repository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw NotFoundException when agenda item does not exist', async () => {
      repository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateAsync(updateDto)).rejects.toThrow(
        `Agenda item ${updateDto.id} not found.`,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw EmptyAgendaItemTitleException when title is empty string', async () => {
      const dtoWithEmptyTitle: UpdateAgendaItemDto = {
        ...updateDto,
        title: '',
      };
      repository.getAsync.mockResolvedValue(mockAgendaItem);

      await expect(service.updateAsync(dtoWithEmptyTitle)).rejects.toThrow(
        EmptyAgendaItemTitleException,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw EmptyAgendaItemTitleException when title is only whitespace', async () => {
      const dtoWithWhitespaceTitle: UpdateAgendaItemDto = {
        ...updateDto,
        title: '   ',
      };
      repository.getAsync.mockResolvedValue(mockAgendaItem);

      await expect(service.updateAsync(dtoWithWhitespaceTitle)).rejects.toThrow(
        EmptyAgendaItemTitleException,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow update when title is undefined', async () => {
      const dtoWithoutTitle: UpdateAgendaItemDto = {
        id: mockAgendaItem.id,
        level: 4,
      };
      repository.getAsync.mockResolvedValue(mockAgendaItem);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithoutTitle);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithoutTitle);
    });

    it('should throw Error when level is less than 1', async () => {
      const dtoWithInvalidLevel: UpdateAgendaItemDto = {
        ...updateDto,
        level: 0,
      };
      repository.getAsync.mockResolvedValue(mockAgendaItem);

      await expect(service.updateAsync(dtoWithInvalidLevel)).rejects.toThrow(
        'Level must be between 1 and 6.',
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when level is greater than 6', async () => {
      const dtoWithInvalidLevel: UpdateAgendaItemDto = {
        ...updateDto,
        level: 7,
      };
      repository.getAsync.mockResolvedValue(mockAgendaItem);

      await expect(service.updateAsync(dtoWithInvalidLevel)).rejects.toThrow(
        'Level must be between 1 and 6.',
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow update when level is undefined', async () => {
      const dtoWithoutLevel: UpdateAgendaItemDto = {
        id: mockAgendaItem.id,
        title: 'New Title',
      };
      repository.getAsync.mockResolvedValue(mockAgendaItem);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithoutLevel);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithoutLevel);
    });
  });

  describe('deleteAsync', () => {
    it('should delete agenda item successfully', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaItem);
      repository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockAgendaItem.id);

      expect(repository.getAsync).toHaveBeenCalledWith(mockAgendaItem.id);
      expect(repository.deleteAsync).toHaveBeenCalledWith(mockAgendaItem.id);
    });

    it('should throw NotFoundException when agenda item does not exist', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteAsync(id)).rejects.toThrow(`Agenda item ${id} not found.`);
      expect(repository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
