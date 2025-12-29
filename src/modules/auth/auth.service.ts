import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class AuthService {
  private readonly apiKey: string | undefined;

  constructor(readonly config: ConfigService) {
    this.apiKey = config.get('API_KEY');
  }

  getMicroservicesAuthHeaders(
    language: string = 'pl',
    customHeaders?: Record<string, string>,
  ): AxiosRequestConfig {
    return {
      headers: {
        'Accept-Language': language,
        ...(this.apiKey ? { 'Api-Key': this.apiKey } : {}),
        ...customHeaders,
      },
    };
  }
}
