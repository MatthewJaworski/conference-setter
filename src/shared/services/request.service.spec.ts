import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { RequestService, RequestHeaders } from './request.service';

describe('RequestService', () => {
  let service: RequestService;
  let httpService: jest.Mocked<HttpService>;

  const mockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {},
    } as AxiosResponse['config'],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RequestService>(RequestService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    const url = 'https://api.example.com/data';
    const responseData = { id: 1, name: 'Test' };

    it('should make GET request without headers', async () => {
      httpService.get.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.get(url);

      expect(httpService.get).toHaveBeenCalledWith(url, { headers: {} });
      expect(result).toEqual(responseData);
    });

    it('should make GET request with userId header', async () => {
      const headers: RequestHeaders = { userId: 'user-123' };
      httpService.get.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.get(url, headers);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: { 'x-id-claim': 'user-123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make GET request with authorization header', async () => {
      const headers: RequestHeaders = { authorization: 'Bearer token123' };
      httpService.get.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.get(url, headers);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: { authorization: 'Bearer token123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make GET request with both headers', async () => {
      const headers: RequestHeaders = {
        userId: 'user-123',
        authorization: 'Bearer token123',
      };
      httpService.get.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.get(url, headers);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'x-id-claim': 'user-123',
          authorization: 'Bearer token123',
        },
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('post', () => {
    const url = 'https://api.example.com/data';
    const requestData = { name: 'New Item' };
    const responseData = { id: 1, name: 'New Item' };

    it('should make POST request without headers', async () => {
      httpService.post.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.post(url, requestData);

      expect(httpService.post).toHaveBeenCalledWith(url, requestData, { headers: {} });
      expect(result).toEqual(responseData);
    });

    it('should make POST request with userId header', async () => {
      const headers: RequestHeaders = { userId: 'user-123' };
      httpService.post.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.post(url, requestData, headers);

      expect(httpService.post).toHaveBeenCalledWith(url, requestData, {
        headers: { 'x-id-claim': 'user-123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make POST request with authorization header', async () => {
      const headers: RequestHeaders = { authorization: 'Bearer token123' };
      httpService.post.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.post(url, requestData, headers);

      expect(httpService.post).toHaveBeenCalledWith(url, requestData, {
        headers: { authorization: 'Bearer token123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make POST request with both headers', async () => {
      const headers: RequestHeaders = {
        userId: 'user-123',
        authorization: 'Bearer token123',
      };
      httpService.post.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.post(url, requestData, headers);

      expect(httpService.post).toHaveBeenCalledWith(url, requestData, {
        headers: {
          'x-id-claim': 'user-123',
          authorization: 'Bearer token123',
        },
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('put', () => {
    const url = 'https://api.example.com/data/1';
    const requestData = { name: 'Updated Item' };
    const responseData = { id: 1, name: 'Updated Item' };

    it('should make PUT request without headers', async () => {
      httpService.put.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.put(url, requestData);

      expect(httpService.put).toHaveBeenCalledWith(url, requestData, { headers: {} });
      expect(result).toEqual(responseData);
    });

    it('should make PUT request with userId header', async () => {
      const headers: RequestHeaders = { userId: 'user-123' };
      httpService.put.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.put(url, requestData, headers);

      expect(httpService.put).toHaveBeenCalledWith(url, requestData, {
        headers: { 'x-id-claim': 'user-123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make PUT request with authorization header', async () => {
      const headers: RequestHeaders = { authorization: 'Bearer token123' };
      httpService.put.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.put(url, requestData, headers);

      expect(httpService.put).toHaveBeenCalledWith(url, requestData, {
        headers: { authorization: 'Bearer token123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make PUT request with both headers', async () => {
      const headers: RequestHeaders = {
        userId: 'user-123',
        authorization: 'Bearer token123',
      };
      httpService.put.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.put(url, requestData, headers);

      expect(httpService.put).toHaveBeenCalledWith(url, requestData, {
        headers: {
          'x-id-claim': 'user-123',
          authorization: 'Bearer token123',
        },
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('delete', () => {
    const url = 'https://api.example.com/data/1';
    const responseData = { success: true };

    it('should make DELETE request without headers', async () => {
      httpService.delete.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.delete(url);

      expect(httpService.delete).toHaveBeenCalledWith(url, { headers: {} });
      expect(result).toEqual(responseData);
    });

    it('should make DELETE request with userId header', async () => {
      const headers: RequestHeaders = { userId: 'user-123' };
      httpService.delete.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.delete(url, headers);

      expect(httpService.delete).toHaveBeenCalledWith(url, {
        headers: { 'x-id-claim': 'user-123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make DELETE request with authorization header', async () => {
      const headers: RequestHeaders = { authorization: 'Bearer token123' };
      httpService.delete.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.delete(url, headers);

      expect(httpService.delete).toHaveBeenCalledWith(url, {
        headers: { authorization: 'Bearer token123' },
      });
      expect(result).toEqual(responseData);
    });

    it('should make DELETE request with both headers', async () => {
      const headers: RequestHeaders = {
        userId: 'user-123',
        authorization: 'Bearer token123',
      };
      httpService.delete.mockReturnValue(of(mockAxiosResponse(responseData)));

      const result = await service.delete(url, headers);

      expect(httpService.delete).toHaveBeenCalledWith(url, {
        headers: {
          'x-id-claim': 'user-123',
          authorization: 'Bearer token123',
        },
      });
      expect(result).toEqual(responseData);
    });
  });
});
