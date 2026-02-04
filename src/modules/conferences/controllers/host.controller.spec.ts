import { Test, TestingModule } from '@nestjs/testing';
import { HostController } from './host.controller';
import { HostService } from '../services/host.service';
import { HostDetailsDto } from '../dtos/host-detials.dto';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';

describe('HostController', () => {
  let controller: HostController;
  let hostService: jest.Mocked<HostService>;

  const mockHostDetails: HostDetailsDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tech Conference Organizers',
    description: 'Leading technology conference organizer since 2010',
    conferences: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        hostId: '123e4567-e89b-12d3-a456-426614174000',
        hostName: 'Tech Conference Organizers',
        name: 'Annual Tech Summit 2025',
        location: 'Warsaw, Poland',
        from: new Date('2025-06-01'),
        to: new Date('2025-06-03'),
      } as ConferenceDetailsDto,
    ],
  };

  const mockHostDto: ConferenceDetailsDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    hostId: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tech Conference Organizers',
  } as ConferenceDetailsDto;

  beforeEach(async () => {
    const mockHostService = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostController],
      providers: [{ provide: HostService, useValue: mockHostService }],
    }).compile();

    controller = module.get<HostController>(HostController);
    hostService = module.get(HostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a single host with details', async () => {
      hostService.getAsync.mockResolvedValue(mockHostDetails);

      const result = await controller.get(mockHostDetails.id);

      expect(result).toEqual(mockHostDetails);
      expect(hostService.getAsync).toHaveBeenCalledWith(mockHostDetails.id);
    });

    it('should return null when host does not exist', async () => {
      hostService.getAsync.mockResolvedValue(null);

      const result = await controller.get('non-existent-id');

      expect(result).toBeNull();
      expect(hostService.getAsync).toHaveBeenCalledWith('non-existent-id');
    });

    it('should call getAsync with the provided id', async () => {
      const hostId = 'test-host-id';
      hostService.getAsync.mockResolvedValue(mockHostDetails);

      await controller.get(hostId);

      expect(hostService.getAsync).toHaveBeenCalledWith(hostId);
      expect(hostService.getAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('browse', () => {
    it('should return all hosts', async () => {
      const mockHosts = [
        { id: 'host-1', name: 'Host One', description: 'First host' },
        { id: 'host-2', name: 'Host Two', description: 'Second host' },
      ];
      hostService.browseAsync.mockResolvedValue(mockHosts);

      const result = await controller.browse();

      expect(result).toEqual(mockHosts);
      expect(hostService.browseAsync).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no hosts exist', async () => {
      hostService.browseAsync.mockResolvedValue([]);

      const result = await controller.browse();

      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should create a new host', async () => {
      hostService.addAsync.mockResolvedValue(undefined);

      await controller.add(mockHostDto);

      expect(hostService.addAsync).toHaveBeenCalledWith(mockHostDto);
    });

    it('should return void on successful creation', async () => {
      const createDto: ConferenceDetailsDto = {
        id: 'new-host-id',
        hostId: 'new-host-id',
        name: 'New Host',
      } as ConferenceDetailsDto;

      hostService.addAsync.mockResolvedValue(undefined);

      const result = await controller.add(createDto);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an existing host', async () => {
      const hostId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: HostDetailsDto = {
        id: hostId,
        name: 'Updated Host Name',
        description: 'Updated description',
      };

      hostService.updateAsync.mockResolvedValue(undefined);

      await controller.update(hostId, updateDto);

      expect(hostService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: hostId,
      });
    });

    it('should merge id from param with dto', async () => {
      const hostId = 'param-host-id';
      const updateDto: HostDetailsDto = {
        id: 'dto-host-id',
        name: 'Updated Name',
      };

      hostService.updateAsync.mockResolvedValue(undefined);

      await controller.update(hostId, updateDto);

      expect(hostService.updateAsync).toHaveBeenCalledWith({
        ...updateDto,
        id: hostId,
      });
    });

    it('should return void on successful update', async () => {
      const updateDto: HostDetailsDto = {
        id: 'host-id',
        name: 'Test Host',
      };

      hostService.updateAsync.mockResolvedValue(undefined);

      const result = await controller.update('host-id', updateDto);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a host', async () => {
      const hostId = '123e4567-e89b-12d3-a456-426614174000';

      hostService.deleteAsync.mockResolvedValue(undefined);

      await controller.delete(hostId);

      expect(hostService.deleteAsync).toHaveBeenCalledWith(hostId);
    });

    it('should return void on successful deletion', async () => {
      hostService.deleteAsync.mockResolvedValue(undefined);

      const result = await controller.delete('host-id');

      expect(result).toBeUndefined();
    });

    it('should call deleteAsync with the provided id', async () => {
      const hostId = 'test-delete-id';

      hostService.deleteAsync.mockResolvedValue(undefined);

      await controller.delete(hostId);

      expect(hostService.deleteAsync).toHaveBeenCalledWith(hostId);
      expect(hostService.deleteAsync).toHaveBeenCalledTimes(1);
    });
  });
});
