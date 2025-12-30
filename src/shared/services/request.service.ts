import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface RequestHeaders {
  userId?: string;
  authorization?: string;
}

@Injectable()
export class RequestService {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, headers?: RequestHeaders): Promise<T> {
    const requestHeaders: Record<string, string | string[]> = {};

    if (headers?.userId) {
      requestHeaders['x-id-claim'] = headers.userId;
    }

    if (headers?.authorization) {
      requestHeaders['authorization'] = headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.get<T>(url, { headers: requestHeaders }),
    );

    return response.data;
  }

  async post<T>(url: string, data: unknown, headers?: RequestHeaders): Promise<T> {
    const requestHeaders: Record<string, string | string[]> = {};

    if (headers?.userId) {
      requestHeaders['x-id-claim'] = headers.userId;
    }

    if (headers?.authorization) {
      requestHeaders['authorization'] = headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.post<T>(url, data, { headers: requestHeaders }),
    );

    return response.data;
  }

  async put<T>(url: string, data: unknown, headers?: RequestHeaders): Promise<T> {
    const requestHeaders: Record<string, string | string[]> = {};

    if (headers?.userId) {
      requestHeaders['x-id-claim'] = headers.userId;
    }

    if (headers?.authorization) {
      requestHeaders['authorization'] = headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.put<T>(url, data, { headers: requestHeaders }),
    );

    return response.data;
  }

  async delete<T>(url: string, headers?: RequestHeaders): Promise<T> {
    const requestHeaders: Record<string, string | string[]> = {};

    if (headers?.userId) {
      requestHeaders['x-id-claim'] = headers.userId;
    }

    if (headers?.authorization) {
      requestHeaders['authorization'] = headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.delete<T>(url, { headers: requestHeaders }),
    );

    return response.data;
  }
}
