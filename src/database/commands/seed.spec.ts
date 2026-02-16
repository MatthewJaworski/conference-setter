/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';
import { mockHosts } from '@/shared/mocks/hosts.mock';
import { mockConferences } from '@/shared/mocks/conferences.mock';
import { mockSpeakers } from '@/shared/mocks/speakers.mock';
import { mockAgendaItems } from '@/shared/mocks/agenda-items.mock';
import {
  mockAgendaTracks,
  mockPlaceholderSlots,
  mockRegularSlots,
} from '@/shared/mocks/agenda.mock';

interface MockRepository {
  save: jest.Mock;
  create: jest.Mock;
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
}

describe('seedDatabase', () => {
  let mockDataSource: jest.Mocked<DataSource>;
  let mockLogger: jest.Mocked<Logger>;
  let repositories: Record<string, MockRepository>;

  const createMockRepository = (): MockRepository => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const deleteMock = jest.fn().mockReturnValue({ execute: executeMock });
    return {
      save: jest.fn().mockImplementation((entities) => {
        if (Array.isArray(entities)) {
          return Promise.resolve(
            entities.map((e: Record<string, unknown>, i: number) => ({
              ...e,
              id: `generated-id-${i}`,
            })),
          );
        }
        return Promise.resolve({ ...entities, id: 'generated-id-0' });
      }),
      create: jest.fn().mockImplementation((data) => data),
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue({ delete: deleteMock }),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    repositories = {
      HostEntity: createMockRepository(),
      ConferenceEntity: createMockRepository(),
      SpeakerEntity: createMockRepository(),
      AgendaItemEntity: createMockRepository(),
      AgendaTrackEntity: createMockRepository(),
      PlaceholderAgendaSlotEntity: createMockRepository(),
      RegularAgendaSlotEntity: createMockRepository(),
    };

    mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn((entity: { name?: string }) => {
        const name = entity.name ?? '';
        if (name.includes('Host')) return repositories['HostEntity'];
        if (name.includes('Conference')) return repositories['ConferenceEntity'];
        if (name.includes('Speaker')) return repositories['SpeakerEntity'];
        if (name.includes('AgendaItem')) return repositories['AgendaItemEntity'];
        if (name.includes('AgendaTrack')) return repositories['AgendaTrackEntity'];
        if (name.includes('Placeholder')) return repositories['PlaceholderAgendaSlotEntity'];
        if (name.includes('Regular')) return repositories['RegularAgendaSlotEntity'];
        return createMockRepository();
      }),
    } as unknown as jest.Mocked<DataSource>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
  });

  it('should initialize the data source', async () => {
    await seedDatabase(mockDataSource, mockLogger);

    expect(mockDataSource.initialize).toHaveBeenCalledTimes(1);
  });

  it('should destroy the data source after seeding', async () => {
    await seedDatabase(mockDataSource, mockLogger);

    expect(mockDataSource.destroy).toHaveBeenCalledTimes(1);
  });

  it('should get repositories for all 7 entity types', async () => {
    await seedDatabase(mockDataSource, mockLogger);

    expect(mockDataSource.getRepository).toHaveBeenCalledTimes(7);
  });

  describe('clearing existing data', () => {
    it('should delete data from all 7 tables', async () => {
      await seedDatabase(mockDataSource, mockLogger);

      for (const repo of Object.values(repositories)) {
        expect(repo.createQueryBuilder).toHaveBeenCalled();
      }
    });

    it('should delete data in correct FK order (children before parents)', async () => {
      const deleteOrder: string[] = [];

      for (const [name, repo] of Object.entries(repositories)) {
        const executeMock = jest.fn().mockImplementation(() => {
          deleteOrder.push(name);
          return Promise.resolve(undefined);
        });
        const deleteMock = jest.fn().mockReturnValue({ execute: executeMock });
        repo.createQueryBuilder.mockReturnValue({ delete: deleteMock });
      }

      await seedDatabase(mockDataSource, mockLogger);

      expect(deleteOrder).toEqual([
        'RegularAgendaSlotEntity',
        'PlaceholderAgendaSlotEntity',
        'AgendaTrackEntity',
        'AgendaItemEntity',
        'ConferenceEntity',
        'HostEntity',
        'SpeakerEntity',
      ]);
    });
  });

  describe('seeding hosts', () => {
    it('should create and save all hosts from mock data', async () => {
      const hostRepo = repositories['HostEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(hostRepo.create).toHaveBeenCalledTimes(mockHosts.length);
      expect(hostRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should pass host data to create without modification', async () => {
      const hostRepo = repositories['HostEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      mockHosts.forEach((hostData, i) => {
        expect(hostRepo.create).toHaveBeenNthCalledWith(i + 1, hostData);
      });
    });
  });

  describe('seeding conferences', () => {
    it('should create and save all conferences from mock data', async () => {
      const confRepo = repositories['ConferenceEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(confRepo.create).toHaveBeenCalledTimes(mockConferences.length);
      expect(confRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should resolve hostIndex to actual host id', async () => {
      const confRepo = repositories['ConferenceEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      for (let i = 0; i < mockConferences.length; i++) {
        const createCall = confRepo.create.mock.calls[i][0] as Record<string, unknown>;
        expect(createCall).toHaveProperty('hostId');
        expect(createCall).not.toHaveProperty('hostIndex');
      }
    });
  });

  describe('seeding speakers', () => {
    it('should create and save all speakers from mock data', async () => {
      const speakerRepo = repositories['SpeakerEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(speakerRepo.create).toHaveBeenCalledTimes(mockSpeakers.length);
      expect(speakerRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('seeding agenda items', () => {
    it('should create and save all agenda items from mock data', async () => {
      const itemRepo = repositories['AgendaItemEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(itemRepo.create).toHaveBeenCalledTimes(mockAgendaItems.length);
      expect(itemRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should resolve conferenceIndex and speakerIndices to actual ids', async () => {
      const itemRepo = repositories['AgendaItemEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      for (let i = 0; i < mockAgendaItems.length; i++) {
        const createCall = itemRepo.create.mock.calls[i][0] as Record<string, unknown>;
        expect(createCall).toHaveProperty('conferenceId');
        expect(createCall).toHaveProperty('speakerIds');
        expect(createCall).not.toHaveProperty('conferenceIndex');
        expect(createCall).not.toHaveProperty('speakerIndices');
        expect(Array.isArray(createCall['speakerIds'])).toBe(true);
      }
    });
  });

  describe('seeding agenda tracks', () => {
    it('should create and save all agenda tracks from mock data', async () => {
      const trackRepo = repositories['AgendaTrackEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(trackRepo.create).toHaveBeenCalledTimes(mockAgendaTracks.length);
      expect(trackRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should resolve conferenceIndex to actual conference id', async () => {
      const trackRepo = repositories['AgendaTrackEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      for (let i = 0; i < mockAgendaTracks.length; i++) {
        const createCall = trackRepo.create.mock.calls[i][0] as Record<string, unknown>;
        expect(createCall).toHaveProperty('conferenceId');
        expect(createCall).not.toHaveProperty('conferenceIndex');
      }
    });
  });

  describe('seeding placeholder slots', () => {
    it('should create and save all placeholder slots from mock data', async () => {
      const placeholderRepo = repositories['PlaceholderAgendaSlotEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(placeholderRepo.create).toHaveBeenCalledTimes(mockPlaceholderSlots.length);
      expect(placeholderRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should resolve trackIndex to actual track id', async () => {
      const placeholderRepo = repositories['PlaceholderAgendaSlotEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      for (let i = 0; i < mockPlaceholderSlots.length; i++) {
        const createCall = placeholderRepo.create.mock.calls[i][0] as Record<string, unknown>;
        expect(createCall).toHaveProperty('trackId');
        expect(createCall).not.toHaveProperty('trackIndex');
      }
    });
  });

  describe('seeding regular slots', () => {
    it('should create and save all regular slots from mock data', async () => {
      const regularRepo = repositories['RegularAgendaSlotEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      expect(regularRepo.create).toHaveBeenCalledTimes(mockRegularSlots.length);
      expect(regularRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should resolve trackIndex and agendaItemIndex to actual ids', async () => {
      const regularRepo = repositories['RegularAgendaSlotEntity'];

      await seedDatabase(mockDataSource, mockLogger);

      for (let i = 0; i < mockRegularSlots.length; i++) {
        const createCall = regularRepo.create.mock.calls[i][0] as Record<string, unknown>;
        expect(createCall).toHaveProperty('trackId');
        expect(createCall).toHaveProperty('agendaItemId');
        expect(createCall).not.toHaveProperty('trackIndex');
        expect(createCall).not.toHaveProperty('agendaItemIndex');
      }
    });
  });

  describe('logging', () => {
    it('should log seed data summary with counts', async () => {
      repositories['HostEntity'].count.mockResolvedValue(3);
      repositories['ConferenceEntity'].count.mockResolvedValue(6);
      repositories['SpeakerEntity'].count.mockResolvedValue(6);
      repositories['AgendaItemEntity'].count.mockResolvedValue(12);
      repositories['AgendaTrackEntity'].count.mockResolvedValue(7);
      repositories['PlaceholderAgendaSlotEntity'].count.mockResolvedValue(5);
      repositories['RegularAgendaSlotEntity'].count.mockResolvedValue(12);

      await seedDatabase(mockDataSource, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('Database connected successfully');
      expect(mockLogger.log).toHaveBeenCalledWith('Cleared existing data');
      expect(mockLogger.log).toHaveBeenCalledWith('- 3 hosts');
      expect(mockLogger.log).toHaveBeenCalledWith('- 6 conferences');
      expect(mockLogger.log).toHaveBeenCalledWith('- 6 speakers');
      expect(mockLogger.log).toHaveBeenCalledWith('- 12 agenda items');
      expect(mockLogger.log).toHaveBeenCalledWith('- 7 agenda tracks');
      expect(mockLogger.log).toHaveBeenCalledWith('- 5 placeholder slots');
      expect(mockLogger.log).toHaveBeenCalledWith('- 12 regular slots');
      expect(mockLogger.log).toHaveBeenCalledWith('\nDatabase seeding completed successfully!');
    });
  });

  describe('error propagation', () => {
    it('should propagate initialization error', async () => {
      mockDataSource.initialize.mockRejectedValue(new Error('Connection failed'));

      await expect(seedDatabase(mockDataSource, mockLogger)).rejects.toThrow('Connection failed');
    });

    it('should propagate save error', async () => {
      repositories['HostEntity'].save.mockRejectedValue(new Error('Save failed'));

      await expect(seedDatabase(mockDataSource, mockLogger)).rejects.toThrow('Save failed');
    });

    it('should propagate delete error', async () => {
      const executeMock = jest.fn().mockRejectedValue(new Error('Delete failed'));
      const deleteMock = jest.fn().mockReturnValue({ execute: executeMock });
      repositories['RegularAgendaSlotEntity'].createQueryBuilder.mockReturnValue({
        delete: deleteMock,
      });

      await expect(seedDatabase(mockDataSource, mockLogger)).rejects.toThrow('Delete failed');
    });
  });
});
