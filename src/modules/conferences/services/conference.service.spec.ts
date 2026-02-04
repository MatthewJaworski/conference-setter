import { Test, TestingModule } from '@nestjs/testing';
import { ConferenceService } from './conference.service';
import { ConferencesRepository } from '../repositories/conference.repository';
import { HostsRepository } from '../repositories/host.repository';
import { HostNotExistsException } from '@/shared/exceptions/host-not-exists.exception';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { ConferenceNotExistsException } from '@/shared/exceptions/conference-not-exists.exception';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';

describe('ConferenceService', () => {
  let service: ConferenceService;
  let conferenceRepository: jest.Mocked<ConferencesRepository>;
  let hostsRepository: jest.Mocked<HostsRepository>;

  const mockConference: ConferenceDetailsDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    hostId: '123e4567-e89b-12d3-a456-426614174001',
    hostName: 'Tech Host',
    name: 'Annual Tech Summit 2025',
    description: 'The biggest tech conference',
    location: 'Warsaw, Poland',
    logoUrl: 'https://example.com/logo.png',
    participantsLimit: 500,
    from: new Date('2025-06-01T09:00:00Z'),
    to: new Date('2025-06-03T18:00:00Z'),
  };

  const mockConferences: ConferenceDetailsDto[] = [
    mockConference,
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      hostId: '123e4567-e89b-12d3-a456-426614174001',
      hostName: 'Tech Host',
      name: 'DevOps Summit 2025',
      description: 'DevOps conference',
      location: 'Krakow, Poland',
      logoUrl: undefined,
      participantsLimit: 200,
      from: new Date('2025-07-01T09:00:00Z'),
      to: new Date('2025-07-02T18:00:00Z'),
    },
  ];

  const mockHost = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Tech Host',
  };

  beforeEach(async () => {
    const mockConferenceRepository = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const mockHostsRepository = {
      getAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferenceService,
        {
          provide: ConferencesRepository,
          useValue: mockConferenceRepository,
        },
        {
          provide: HostsRepository,
          useValue: mockHostsRepository,
        },
      ],
    }).compile();

    service = module.get<ConferenceService>(ConferenceService);
    conferenceRepository = module.get(ConferencesRepository);
    hostsRepository = module.get(HostsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return conference when found', async () => {
      conferenceRepository.getAsync.mockResolvedValue(mockConference);

      const result = await service.getAsync(mockConference.id);

      expect(result).toEqual(mockConference);
      expect(conferenceRepository.getAsync).toHaveBeenCalledWith(mockConference.id);
    });

    it('should return null when conference not found', async () => {
      conferenceRepository.getAsync.mockResolvedValue(null);

      const result = await service.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all conferences', async () => {
      conferenceRepository.browseAsync.mockResolvedValue(mockConferences);

      const result = await service.browseAsync();

      expect(result).toEqual(mockConferences);
      expect(conferenceRepository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no conferences exist', async () => {
      conferenceRepository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: ConferenceCreateDto = {
      hostId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'New Conference',
      description: 'A new conference',
      location: 'Gdansk, Poland',
      from: new Date('2025-08-01T09:00:00Z'),
      to: new Date('2025-08-02T18:00:00Z'),
    };

    it('should add conference successfully', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHost);
      conferenceRepository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(hostsRepository.getAsync).toHaveBeenCalledWith(createDto.hostId);
      expect(conferenceRepository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should throw HostNotExistsException when host does not exist', async () => {
      hostsRepository.getAsync.mockResolvedValue(null);

      await expect(service.addAsync(createDto)).rejects.toThrow(HostNotExistsException);
      expect(conferenceRepository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: ConferenceCreateDto = {
        ...createDto,
        from: new Date('2025-08-03T09:00:00Z'),
        to: new Date('2025-08-01T18:00:00Z'),
      };
      hostsRepository.getAsync.mockResolvedValue(mockHost);

      await expect(service.addAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(conferenceRepository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const sameDate = new Date('2025-08-01T09:00:00Z');
      const dtoWithSameDates: ConferenceCreateDto = {
        ...createDto,
        from: sameDate,
        to: sameDate,
      };
      hostsRepository.getAsync.mockResolvedValue(mockHost);

      await expect(service.addAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(conferenceRepository.addAsync).not.toHaveBeenCalled();
    });
  });

  describe('updateAsync', () => {
    const updateDto: ConferenceUpdateDto = {
      id: mockConference.id,
      name: 'Updated Conference Name',
      from: new Date('2025-06-01T10:00:00Z'),
      to: new Date('2025-06-04T18:00:00Z'),
    };

    it('should update conference successfully', async () => {
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      conferenceRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(conferenceRepository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(conferenceRepository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw ConferenceNotExistsException when conference does not exist', async () => {
      conferenceRepository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(ConferenceNotExistsException);
      expect(conferenceRepository.updateAsync).not.toHaveBeenCalled();
    });

    it('should update conference with new hostId when host exists', async () => {
      const newHostId = '123e4567-e89b-12d3-a456-426614174999';
      const dtoWithNewHost: ConferenceUpdateDto = {
        ...updateDto,
        hostId: newHostId,
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      hostsRepository.getAsync.mockResolvedValue({ id: newHostId, name: 'New Host' });
      conferenceRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithNewHost);

      expect(hostsRepository.getAsync).toHaveBeenCalledWith(newHostId);
      expect(conferenceRepository.updateAsync).toHaveBeenCalledWith(dtoWithNewHost);
    });

    it('should throw HostNotExistsException when updating with non-existent host', async () => {
      const dtoWithInvalidHost: ConferenceUpdateDto = {
        ...updateDto,
        hostId: 'non-existent-host-id',
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      hostsRepository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(dtoWithInvalidHost)).rejects.toThrow(HostNotExistsException);
      expect(conferenceRepository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date is after to date', async () => {
      const dtoWithWrongDates: ConferenceUpdateDto = {
        id: mockConference.id,
        from: new Date('2025-06-05T09:00:00Z'),
        to: new Date('2025-06-01T18:00:00Z'),
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);

      await expect(service.updateAsync(dtoWithWrongDates)).rejects.toThrow(WrongDatesException);
      expect(conferenceRepository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw WrongDatesException when from date equals to date', async () => {
      const sameDate = new Date('2025-06-01T09:00:00Z');
      const dtoWithSameDates: ConferenceUpdateDto = {
        id: mockConference.id,
        from: sameDate,
        to: sameDate,
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);

      await expect(service.updateAsync(dtoWithSameDates)).rejects.toThrow(WrongDatesException);
      expect(conferenceRepository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow update when only from date is provided', async () => {
      const dtoWithOnlyFrom: ConferenceUpdateDto = {
        id: mockConference.id,
        from: new Date('2025-06-01T08:00:00Z'),
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      conferenceRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyFrom);

      expect(conferenceRepository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyFrom);
    });

    it('should allow update when only to date is provided', async () => {
      const dtoWithOnlyTo: ConferenceUpdateDto = {
        id: mockConference.id,
        to: new Date('2025-06-05T18:00:00Z'),
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      conferenceRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyTo);

      expect(conferenceRepository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyTo);
    });

    it('should allow update without hostId validation when hostId is not provided', async () => {
      const dtoWithoutHost: ConferenceUpdateDto = {
        id: mockConference.id,
        name: 'Updated Name Only',
      };
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      conferenceRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithoutHost);

      expect(hostsRepository.getAsync).not.toHaveBeenCalled();
      expect(conferenceRepository.updateAsync).toHaveBeenCalledWith(dtoWithoutHost);
    });
  });

  describe('deleteAsync', () => {
    it('should delete conference successfully', async () => {
      conferenceRepository.getAsync.mockResolvedValue(mockConference);
      conferenceRepository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockConference.id);

      expect(conferenceRepository.getAsync).toHaveBeenCalledWith(mockConference.id);
      expect(conferenceRepository.deleteAsync).toHaveBeenCalledWith(mockConference.id);
    });

    it('should throw ConferenceNotExistsException when conference does not exist', async () => {
      const id = 'non-existent-id';
      conferenceRepository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(ConferenceNotExistsException);
      expect(conferenceRepository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
