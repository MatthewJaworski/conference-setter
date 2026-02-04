import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerController } from './spearker.controller';
import { SpeakerService } from '../services/speaker.service';
import { SpeakerDto } from '../dtos/speaker.dto';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';

describe('SpeakerController', () => {
  let controller: SpeakerController;
  let speakerService: jest.Mocked<SpeakerService>;

  const mockSpeaker: SpeakerDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    bio: 'Experienced software engineer with 10+ years in the industry',
    avatarUrl: 'https://example.com/avatars/john-doe.jpg',
  };

  beforeEach(async () => {
    const mockSpeakerService = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeakerController],
      providers: [{ provide: SpeakerService, useValue: mockSpeakerService }],
    }).compile();

    controller = module.get<SpeakerController>(SpeakerController);
    speakerService = module.get(SpeakerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a single speaker', async () => {
      speakerService.getAsync.mockResolvedValue(mockSpeaker);

      const result = await controller.get(mockSpeaker.id);

      expect(result).toEqual(mockSpeaker);
      expect(speakerService.getAsync).toHaveBeenCalledWith(mockSpeaker.id);
    });

    it('should return null when speaker does not exist', async () => {
      speakerService.getAsync.mockResolvedValue(null);

      const result = await controller.get('non-existent-id');

      expect(result).toBeNull();
      expect(speakerService.getAsync).toHaveBeenCalledWith('non-existent-id');
    });

    it('should call getAsync with the provided id', async () => {
      const speakerId = 'test-speaker-id';
      speakerService.getAsync.mockResolvedValue(mockSpeaker);

      await controller.get(speakerId);

      expect(speakerService.getAsync).toHaveBeenCalledWith(speakerId);
      expect(speakerService.getAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('browse', () => {
    it('should return all speakers', async () => {
      const mockSpeakers = [
        mockSpeaker,
        {
          ...mockSpeaker,
          id: 'speaker-2',
          email: 'jane.doe@example.com',
          fullName: 'Jane Doe',
        },
      ];
      speakerService.browseAsync.mockResolvedValue(mockSpeakers);

      const result = await controller.browse();

      expect(result).toEqual(mockSpeakers);
      expect(speakerService.browseAsync).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no speakers exist', async () => {
      speakerService.browseAsync.mockResolvedValue([]);

      const result = await controller.browse();

      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should create a new speaker', async () => {
      const createDto: CreateSpeakerDto = {
        email: 'new.speaker@example.com',
        fullName: 'New Speaker',
        bio: 'A talented speaker',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      speakerService.addAsync.mockResolvedValue(undefined);

      await controller.add(createDto);

      expect(speakerService.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should create a speaker with minimal data', async () => {
      const createDto: CreateSpeakerDto = {
        email: 'minimal@example.com',
        fullName: 'Minimal Speaker',
      };

      speakerService.addAsync.mockResolvedValue(undefined);

      await controller.add(createDto);

      expect(speakerService.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should return void on successful creation', async () => {
      const createDto: CreateSpeakerDto = {
        email: 'test@example.com',
        fullName: 'Test Speaker',
      };

      speakerService.addAsync.mockResolvedValue(undefined);

      const result = await controller.add(createDto);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an existing speaker', async () => {
      const speakerId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateSpeakerDto = {
        id: speakerId,
        fullName: 'Updated Speaker Name',
        bio: 'Updated biography',
      };

      speakerService.updateAsync.mockResolvedValue(undefined);

      await controller.update(speakerId, updateDto);

      expect(speakerService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: speakerId,
      });
    });

    it('should merge id from param with dto', async () => {
      const speakerId = 'param-speaker-id';
      const updateDto: UpdateSpeakerDto = {
        id: 'dto-speaker-id',
        fullName: 'Updated Name',
      };

      speakerService.updateAsync.mockResolvedValue(undefined);

      await controller.update(speakerId, updateDto);

      expect(speakerService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: speakerId,
      });
    });

    it('should update speaker email', async () => {
      const speakerId = 'speaker-id';
      const updateDto: UpdateSpeakerDto = {
        id: speakerId,
        email: 'updated.email@example.com',
      };

      speakerService.updateAsync.mockResolvedValue(undefined);

      await controller.update(speakerId, updateDto);

      expect(speakerService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: speakerId,
      });
    });

    it('should return void on successful update', async () => {
      const updateDto: UpdateSpeakerDto = {
        id: 'speaker-id',
        fullName: 'Test',
      };

      speakerService.updateAsync.mockResolvedValue(undefined);

      const result = await controller.update('speaker-id', updateDto);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a speaker', async () => {
      const speakerId = '123e4567-e89b-12d3-a456-426614174000';

      speakerService.deleteAsync.mockResolvedValue(undefined);

      await controller.delete(speakerId);

      expect(speakerService.deleteAsync).toHaveBeenCalledWith(speakerId);
    });

    it('should return void on successful deletion', async () => {
      speakerService.deleteAsync.mockResolvedValue(undefined);

      const result = await controller.delete('speaker-id');

      expect(result).toBeUndefined();
    });

    it('should call deleteAsync with the provided id', async () => {
      const speakerId = 'test-delete-id';

      speakerService.deleteAsync.mockResolvedValue(undefined);

      await controller.delete(speakerId);

      expect(speakerService.deleteAsync).toHaveBeenCalledWith(speakerId);
      expect(speakerService.deleteAsync).toHaveBeenCalledTimes(1);
    });
  });
});
