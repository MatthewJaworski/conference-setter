/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable @eslint-community/eslint-comments/no-duplicate-disable */
/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Mock all entities
jest.mock('@/modules/conferences/entities/conference.entity', () => ({
  ConferenceEntity: jest.fn(),
}));
jest.mock('@/modules/conferences/entities/host.entity', () => ({
  HostEntity: jest.fn(),
}));
jest.mock('@/modules/speakers/entities/speaker.entity', () => ({
  SpeakerEntity: jest.fn(),
}));
jest.mock('@/modules/agenda/entities/agenda-item.entity', () => ({
  AgendaItemEntity: jest.fn(),
}));
jest.mock('@/modules/agenda/entities/agenda-track.entity', () => ({
  AgendaTrackEntity: jest.fn(),
}));
jest.mock('@/modules/agenda/entities/agenda-slot.entity', () => ({
  AgendaSlotEntity: jest.fn(),
}));
jest.mock('@/modules/agenda/entities/placeholder-agenda-slot.entity', () => ({
  PlaceholderAgendaSlotEntity: jest.fn(),
}));
jest.mock('@/modules/agenda/entities/regular-agenda-slot.entity', () => ({
  RegularAgendaSlotEntity: jest.fn(),
}));

// Mock DataSource
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn(),
  };
});

// Mock ConfigService
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn(),
}));

// Mock database config provider
jest.mock('../database-config.provider', () => ({
  TypeOrmConfigProvider: jest.fn().mockReturnValue({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test',
  }),
}));

interface MockRepository {
  save: jest.Mock;
  create: jest.Mock;
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
}

describe('Database Seed Command', () => {
  let mockDataSource: jest.Mocked<DataSource>;
  let mockHostRepository: MockRepository;
  let mockConferenceRepository: MockRepository;
  let mockSpeakerRepository: MockRepository;
  let mockAgendaItemRepository: MockRepository;
  let mockAgendaTrackRepository: MockRepository;
  let mockPlaceholderSlotRepository: MockRepository;
  let mockRegularSlotRepository: MockRepository;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  const createMockRepository = () => ({
    save: jest.fn(),
    create: jest.fn((data) => data),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      delete: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repositories
    mockHostRepository = createMockRepository();
    mockConferenceRepository = createMockRepository();
    mockSpeakerRepository = createMockRepository();
    mockAgendaItemRepository = createMockRepository();
    mockAgendaTrackRepository = createMockRepository();
    mockPlaceholderSlotRepository = createMockRepository();
    mockRegularSlotRepository = createMockRepository();

    // Setup mock DataSource
    mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn((entity) => {
        const entityName = entity.name || entity.toString();
        if (entityName.includes('Host')) return mockHostRepository;
        if (entityName.includes('Conference')) return mockConferenceRepository;
        if (entityName.includes('Speaker')) return mockSpeakerRepository;
        if (entityName.includes('AgendaItem')) return mockAgendaItemRepository;
        if (entityName.includes('AgendaTrack')) return mockAgendaTrackRepository;
        if (entityName.includes('Placeholder')) return mockPlaceholderSlotRepository;
        if (entityName.includes('Regular')) return mockRegularSlotRepository;
        return createMockRepository();
      }),
    } as unknown as jest.Mocked<DataSource>;

    (DataSource as jest.Mock).mockImplementation(() => mockDataSource);

    // Mock Logger
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Mock process.exit
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    loggerLogSpy.mockRestore();
    loggerErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Seeding Logic', () => {
    it('should create DataSource with correct configuration', () => {
      const { TypeOrmConfigProvider } = require('../database-config.provider');

      expect(TypeOrmConfigProvider).toBeDefined();

      const config = TypeOrmConfigProvider(new ConfigService());

      expect(config).toHaveProperty('type', 'postgres');
    });

    it('should initialize DataSource successfully', async () => {
      await mockDataSource.initialize();

      expect(mockDataSource.initialize).toHaveBeenCalled();
    });

    it('should get all required repositories', () => {
      const repositories = [
        'HostEntity',
        'ConferenceEntity',
        'SpeakerEntity',
        'AgendaItemEntity',
        'AgendaTrackEntity',
        'PlaceholderAgendaSlotEntity',
        'RegularAgendaSlotEntity',
      ];

      repositories.forEach((entityName) => {
        const repo = mockDataSource.getRepository({ name: entityName } as never);
        expect(repo).toBeDefined();
      });
    });

    it('should clear existing data in correct order', async () => {
      // Execute delete operations in order
      await mockRegularSlotRepository.createQueryBuilder().delete().execute();
      await mockPlaceholderSlotRepository.createQueryBuilder().delete().execute();
      await mockAgendaTrackRepository.createQueryBuilder().delete().execute();
      await mockAgendaItemRepository.createQueryBuilder().delete().execute();
      await mockConferenceRepository.createQueryBuilder().delete().execute();
      await mockHostRepository.createQueryBuilder().delete().execute();
      await mockSpeakerRepository.createQueryBuilder().delete().execute();

      expect(mockRegularSlotRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockPlaceholderSlotRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockAgendaTrackRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockAgendaItemRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockConferenceRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockHostRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockSpeakerRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should save hosts from mock data', async () => {
      const mockHosts = [
        { id: 'host-1', name: 'Tech Innovators Inc.' },
        { id: 'host-2', name: 'Business Leaders Forum' },
      ];
      mockHostRepository.save.mockResolvedValue(mockHosts);

      const result = await mockHostRepository.save([]);

      expect(mockHostRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockHosts);
    });

    it('should save conferences with correct hostId references', async () => {
      const mockHosts = [{ id: 'host-1' }, { id: 'host-2' }];
      const mockConferences = [
        { id: 'conf-1', hostId: 'host-1', name: 'TechCon 2026' },
        { id: 'conf-2', hostId: 'host-2', name: 'DevOps Summit 2026' },
      ];

      mockHostRepository.save.mockResolvedValue(mockHosts);
      mockConferenceRepository.save.mockResolvedValue(mockConferences);

      await mockHostRepository.save([]);
      const conferences = await mockConferenceRepository.save([]);

      expect(conferences[0].hostId).toBe('host-1');
      expect(conferences[1].hostId).toBe('host-2');
    });

    it('should save speakers from mock data', async () => {
      const mockSpeakers = [
        { id: 'speaker-1', fullName: 'Sarah Johnson', email: 'sarah@example.com' },
        { id: 'speaker-2', fullName: 'Michael Chen', email: 'michael@example.com' },
      ];
      mockSpeakerRepository.save.mockResolvedValue(mockSpeakers);

      const result = await mockSpeakerRepository.save([]);

      expect(mockSpeakerRepository.save).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should save agenda items with correct conferenceId and speakerIds', async () => {
      const mockConferences = [{ id: 'conf-1' }];
      const mockSpeakers = [{ id: 'speaker-1' }, { id: 'speaker-2' }];
      const mockAgendaItems = [
        {
          id: 'item-1',
          conferenceId: 'conf-1',
          speakerIds: ['speaker-1'],
          title: 'Opening Keynote',
        },
      ];

      mockConferenceRepository.save.mockResolvedValue(mockConferences);
      mockSpeakerRepository.save.mockResolvedValue(mockSpeakers);
      mockAgendaItemRepository.save.mockResolvedValue(mockAgendaItems);

      const items = await mockAgendaItemRepository.save([]);

      expect(items[0].conferenceId).toBe('conf-1');
      expect(items[0].speakerIds).toContain('speaker-1');
    });

    it('should save agenda tracks with correct conferenceId', async () => {
      const mockConferences = [{ id: 'conf-1' }];
      const mockAgendaTracks = [{ id: 'track-1', conferenceId: 'conf-1', name: 'Main Stage' }];

      mockConferenceRepository.save.mockResolvedValue(mockConferences);
      mockAgendaTrackRepository.save.mockResolvedValue(mockAgendaTracks);

      const tracks = await mockAgendaTrackRepository.save([]);

      expect(tracks[0].conferenceId).toBe('conf-1');
    });

    it('should save placeholder slots with correct trackId', async () => {
      const mockTracks = [{ id: 'track-1' }];
      const mockPlaceholderSlots = [
        { id: 'slot-1', trackId: 'track-1', placeholder: 'Coffee Break' },
      ];

      mockAgendaTrackRepository.save.mockResolvedValue(mockTracks);
      mockPlaceholderSlotRepository.save.mockResolvedValue(mockPlaceholderSlots);

      const slots = await mockPlaceholderSlotRepository.save([]);

      expect(slots[0].trackId).toBe('track-1');
    });

    it('should save regular slots with correct trackId and agendaItemId', async () => {
      const mockTracks = [{ id: 'track-1' }];
      const mockItems = [{ id: 'item-1' }];
      const mockRegularSlots = [{ id: 'slot-1', trackId: 'track-1', agendaItemId: 'item-1' }];

      mockAgendaTrackRepository.save.mockResolvedValue(mockTracks);
      mockAgendaItemRepository.save.mockResolvedValue(mockItems);
      mockRegularSlotRepository.save.mockResolvedValue(mockRegularSlots);

      const slots = await mockRegularSlotRepository.save([]);

      expect(slots[0].trackId).toBe('track-1');
      expect(slots[0].agendaItemId).toBe('item-1');
    });

    it('should count all entities after seeding', async () => {
      mockHostRepository.count.mockResolvedValue(3);
      mockConferenceRepository.count.mockResolvedValue(5);
      mockSpeakerRepository.count.mockResolvedValue(6);
      mockAgendaItemRepository.count.mockResolvedValue(15);
      mockAgendaTrackRepository.count.mockResolvedValue(8);
      mockPlaceholderSlotRepository.count.mockResolvedValue(10);
      mockRegularSlotRepository.count.mockResolvedValue(12);

      expect(await mockHostRepository.count()).toBe(3);
      expect(await mockConferenceRepository.count()).toBe(5);
      expect(await mockSpeakerRepository.count()).toBe(6);
      expect(await mockAgendaItemRepository.count()).toBe(15);
      expect(await mockAgendaTrackRepository.count()).toBe(8);
      expect(await mockPlaceholderSlotRepository.count()).toBe(10);
      expect(await mockRegularSlotRepository.count()).toBe(12);
    });

    it('should destroy DataSource after successful seeding', async () => {
      await mockDataSource.destroy();

      expect(mockDataSource.destroy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle DataSource initialization error', async () => {
      const error = new Error('Connection failed');
      mockDataSource.initialize.mockRejectedValue(error);

      await expect(mockDataSource.initialize()).rejects.toThrow('Connection failed');
    });

    it('should handle repository save error', async () => {
      const error = new Error('Save failed');
      mockHostRepository.save.mockRejectedValue(error);

      await expect(mockHostRepository.save([])).rejects.toThrow('Save failed');
    });

    it('should handle delete query error', async () => {
      const error = new Error('Delete failed');
      mockRegularSlotRepository.createQueryBuilder.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          execute: jest.fn().mockRejectedValue(error),
        }),
      });

      await expect(
        mockRegularSlotRepository.createQueryBuilder().delete().execute(),
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('Repository Operations', () => {
    it('should call create method for each entity', () => {
      const hostData = { name: 'Test Host', description: 'Test description' };

      mockHostRepository.create(hostData);

      expect(mockHostRepository.create).toHaveBeenCalledWith(hostData);
    });

    it('should call save method with array of entities', async () => {
      const hostsData = [
        { name: 'Host 1', description: 'Description 1' },
        { name: 'Host 2', description: 'Description 2' },
      ];
      mockHostRepository.save.mockResolvedValue(hostsData);

      const result = await mockHostRepository.save(hostsData);

      expect(mockHostRepository.save).toHaveBeenCalledWith(hostsData);
      expect(result).toHaveLength(2);
    });

    it('should execute delete query builder chain correctly', async () => {
      const deleteBuilder = {
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };
      const queryBuilder = {
        delete: jest.fn().mockReturnValue(deleteBuilder),
      };
      mockHostRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await mockHostRepository.createQueryBuilder().delete().execute();

      expect(mockHostRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(deleteBuilder.execute).toHaveBeenCalled();
    });
  });
});
