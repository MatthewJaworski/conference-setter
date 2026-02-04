import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerService } from './speaker.service';
import { SpeakerRepository } from '../repositories/speaker.repository';
import { SpeakerAlreadyExist } from '@/shared/exceptions/speaker-already-exists';
import { SpeakerNotExistsException } from '@/shared/exceptions/speaker-not-exists';
import { SpeakerDto } from '../dtos/speaker.dto';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';

describe('SpeakerService', () => {
  let service: SpeakerService;
  let repository: jest.Mocked<SpeakerRepository>;

  const mockSpeaker: SpeakerDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    bio: 'Experienced software engineer with 10+ years in the industry',
    avatarUrl: 'https://example.com/avatars/john-doe.jpg',
  };

  const mockSpeakers: SpeakerDto[] = [
    mockSpeaker,
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      bio: 'Cloud architect and DevOps expert',
      avatarUrl: 'https://example.com/avatars/jane-smith.jpg',
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      getAsync: jest.fn(),
      getByEmailAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakerService,
        {
          provide: SpeakerRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SpeakerService>(SpeakerService);
    repository = module.get(SpeakerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return speaker when found', async () => {
      repository.getAsync.mockResolvedValue(mockSpeaker);

      const result = await service.getAsync(mockSpeaker.id);

      expect(result).toEqual(mockSpeaker);
      expect(repository.getAsync).toHaveBeenCalledWith(mockSpeaker.id);
    });

    it('should return null when speaker not found', async () => {
      repository.getAsync.mockResolvedValue(null);

      const result = await service.getAsync('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('browseAsync', () => {
    it('should return all speakers', async () => {
      repository.browseAsync.mockResolvedValue(mockSpeakers);

      const result = await service.browseAsync();

      expect(result).toEqual(mockSpeakers);
      expect(repository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no speakers exist', async () => {
      repository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: CreateSpeakerDto = {
      email: 'new.speaker@example.com',
      fullName: 'New Speaker',
      bio: 'A new speaker bio',
      avatarUrl: 'https://example.com/avatars/new-speaker.jpg',
    };

    it('should add speaker successfully', async () => {
      repository.getByEmailAsync.mockResolvedValue(null);
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(repository.getByEmailAsync).toHaveBeenCalledWith(createDto.email);
      expect(repository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should add speaker without optional fields', async () => {
      const dtoWithoutOptional: CreateSpeakerDto = {
        email: 'minimal.speaker@example.com',
        fullName: 'Minimal Speaker',
      };
      repository.getByEmailAsync.mockResolvedValue(null);
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(dtoWithoutOptional);

      expect(repository.addAsync).toHaveBeenCalledWith(dtoWithoutOptional);
    });

    it('should throw SpeakerAlreadyExist when speaker with email already exists', async () => {
      repository.getByEmailAsync.mockResolvedValue(mockSpeaker);

      await expect(service.addAsync(createDto)).rejects.toThrow(SpeakerAlreadyExist);
      expect(repository.addAsync).not.toHaveBeenCalled();
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateSpeakerDto = {
      id: mockSpeaker.id,
      fullName: 'John Doe Updated',
      bio: 'Updated biography',
    };

    it('should update speaker successfully', async () => {
      repository.getAsync.mockResolvedValue(mockSpeaker);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(repository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(repository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw SpeakerNotExistsException when speaker does not exist', async () => {
      repository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(SpeakerNotExistsException);
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should update only email', async () => {
      const dtoWithOnlyEmail: UpdateSpeakerDto = {
        id: mockSpeaker.id,
        email: 'new.email@example.com',
      };
      repository.getAsync.mockResolvedValue(mockSpeaker);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyEmail);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyEmail);
    });

    it('should update only fullName', async () => {
      const dtoWithOnlyFullName: UpdateSpeakerDto = {
        id: mockSpeaker.id,
        fullName: 'New Full Name',
      };
      repository.getAsync.mockResolvedValue(mockSpeaker);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyFullName);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyFullName);
    });

    it('should update only bio', async () => {
      const dtoWithOnlyBio: UpdateSpeakerDto = {
        id: mockSpeaker.id,
        bio: 'New biography content',
      };
      repository.getAsync.mockResolvedValue(mockSpeaker);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyBio);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyBio);
    });

    it('should update only avatarUrl', async () => {
      const dtoWithOnlyAvatarUrl: UpdateSpeakerDto = {
        id: mockSpeaker.id,
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };
      repository.getAsync.mockResolvedValue(mockSpeaker);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithOnlyAvatarUrl);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithOnlyAvatarUrl);
    });
  });

  describe('deleteAsync', () => {
    it('should delete speaker successfully', async () => {
      repository.getAsync.mockResolvedValue(mockSpeaker);
      repository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockSpeaker.id);

      expect(repository.getAsync).toHaveBeenCalledWith(mockSpeaker.id);
      expect(repository.deleteAsync).toHaveBeenCalledWith(mockSpeaker.id);
    });

    it('should throw SpeakerNotExistsException when speaker does not exist', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(SpeakerNotExistsException);
      expect(repository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
