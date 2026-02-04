import { Test, TestingModule } from '@nestjs/testing';
import { ConferenceController } from './conference.controller';
import { ConferenceService } from '../services/conference.service';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';

describe('ConferenceController', () => {
  let controller: ConferenceController;
  let conferenceService: jest.Mocked<ConferenceService>;

  const mockConference: ConferenceDetailsDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    hostId: '123e4567-e89b-12d3-a456-426614174001',
    hostName: 'Tech Conference Host',
    name: 'Annual Tech Summit 2025',
    description: 'Join us for the biggest tech conference',
    location: 'Warsaw, Poland',
    logoUrl: 'https://example.com/logo.png',
    participantsLimit: 500,
    from: new Date('2025-06-01'),
    to: new Date('2025-06-03'),
  };

  beforeEach(async () => {
    const mockConferenceService = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConferenceController],
      providers: [{ provide: ConferenceService, useValue: mockConferenceService }],
    }).compile();

    controller = module.get<ConferenceController>(ConferenceController);
    conferenceService = module.get(ConferenceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a single conference', async () => {
      conferenceService.getAsync.mockResolvedValue(mockConference);

      const result = await controller.get(mockConference.id);

      expect(result).toEqual(mockConference);
      expect(conferenceService.getAsync).toHaveBeenCalledWith(mockConference.id);
    });

    it('should return null when conference does not exist', async () => {
      conferenceService.getAsync.mockResolvedValue(null);

      const result = await controller.get('non-existent-id');

      expect(result).toBeNull();
      expect(conferenceService.getAsync).toHaveBeenCalledWith('non-existent-id');
    });

    it('should call getAsync with the provided id', async () => {
      const conferenceId = 'test-conference-id';
      conferenceService.getAsync.mockResolvedValue(mockConference);

      await controller.get(conferenceId);

      expect(conferenceService.getAsync).toHaveBeenCalledWith(conferenceId);
      expect(conferenceService.getAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('browse', () => {
    it('should return all conferences', async () => {
      const mockConferences = [
        mockConference,
        { ...mockConference, id: 'conference-2', name: 'DevConf 2025' },
      ];
      conferenceService.browseAsync.mockResolvedValue(mockConferences);

      const result = await controller.browse();

      expect(result).toEqual(mockConferences);
      expect(conferenceService.browseAsync).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no conferences exist', async () => {
      conferenceService.browseAsync.mockResolvedValue([]);

      const result = await controller.browse();

      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should create a new conference', async () => {
      const createDto: ConferenceCreateDto = {
        hostId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'New Conference',
        description: 'A new conference',
        location: 'Krakow, Poland',
        from: new Date('2025-07-01'),
        to: new Date('2025-07-03'),
      };

      conferenceService.addAsync.mockResolvedValue(undefined);

      await controller.add(createDto);

      expect(conferenceService.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should return void on successful creation', async () => {
      const createDto: ConferenceCreateDto = {
        hostId: 'host-id',
        name: 'Test Conference',
        from: new Date('2025-08-01'),
        to: new Date('2025-08-02'),
      };

      conferenceService.addAsync.mockResolvedValue(undefined);

      const result = await controller.add(createDto);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an existing conference', async () => {
      const conferenceId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: ConferenceUpdateDto = {
        id: conferenceId,
        name: 'Updated Conference Name',
        location: 'Gdansk, Poland',
      };

      conferenceService.updateAsync.mockResolvedValue(undefined);

      await controller.update(conferenceId, updateDto);

      expect(conferenceService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: conferenceId,
      });
    });

    it('should merge id from param with dto', async () => {
      const conferenceId = 'param-id';
      const updateDto: ConferenceUpdateDto = {
        id: 'dto-id',
        name: 'Updated Name',
      };

      conferenceService.updateAsync.mockResolvedValue(undefined);

      await controller.update(conferenceId, updateDto);

      expect(conferenceService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: conferenceId,
      });
    });

    it('should return void on successful update', async () => {
      const updateDto: ConferenceUpdateDto = {
        id: 'conference-id',
        name: 'Test',
      };

      conferenceService.updateAsync.mockResolvedValue(undefined);

      const result = await controller.update('conference-id', updateDto);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a conference', async () => {
      const conferenceId = '123e4567-e89b-12d3-a456-426614174000';

      conferenceService.deleteAsync.mockResolvedValue(undefined);

      await controller.delete(conferenceId);

      expect(conferenceService.deleteAsync).toHaveBeenCalledWith(conferenceId);
    });

    it('should return void on successful deletion', async () => {
      conferenceService.deleteAsync.mockResolvedValue(undefined);

      const result = await controller.delete('conference-id');

      expect(result).toBeUndefined();
    });

    it('should call deleteAsync with the provided id', async () => {
      const conferenceId = 'test-delete-id';

      conferenceService.deleteAsync.mockResolvedValue(undefined);

      await controller.delete(conferenceId);

      expect(conferenceService.deleteAsync).toHaveBeenCalledWith(conferenceId);
      expect(conferenceService.deleteAsync).toHaveBeenCalledTimes(1);
    });
  });
});
