import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { setupSwagger, SwaggerConfig } from './set-swagger';

const mockSetTitle = jest.fn().mockReturnThis();
const mockSetDescription = jest.fn().mockReturnThis();
const mockSetVersion = jest.fn().mockReturnThis();
const mockAddBearerAuth = jest.fn().mockReturnThis();
const mockBuild = jest.fn().mockReturnValue({});

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: mockSetTitle,
    setDescription: mockSetDescription,
    setVersion: mockSetVersion,
    addBearerAuth: mockAddBearerAuth,
    build: mockBuild,
  })),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
}));

describe('setupSwagger', () => {
  let mockApp: INestApplication;

  const config: SwaggerConfig = {
    title: 'Test API',
    description: 'Test API Description',
    version: '1.0.0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = {} as INestApplication;
  });

  it('should set up swagger with correct title', () => {
    setupSwagger(mockApp, config);

    expect(mockSetTitle).toHaveBeenCalledWith('Test API');
  });

  it('should set up swagger with correct description', () => {
    setupSwagger(mockApp, config);

    expect(mockSetDescription).toHaveBeenCalledWith('Test API Description');
  });

  it('should set up swagger with correct version', () => {
    setupSwagger(mockApp, config);

    expect(mockSetVersion).toHaveBeenCalledWith('1.0.0');
  });

  it('should add bearer auth configuration', () => {
    setupSwagger(mockApp, config);

    expect(mockAddBearerAuth).toHaveBeenCalledWith(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token from Keycloak',
        in: 'header',
      },
      'bearer',
    );
  });

  it('should call build on document builder', () => {
    setupSwagger(mockApp, config);

    expect(mockBuild).toHaveBeenCalled();
  });

  it('should setup swagger module with api path', () => {
    setupSwagger(mockApp, config);

    expect(SwaggerModule.setup).toHaveBeenCalledWith('api', mockApp, expect.any(Function));
  });

  it('should create document when factory is called', () => {
    setupSwagger(mockApp, config);

    const setupMock = SwaggerModule.setup as jest.Mock;
    const setupCall = setupMock.mock.calls[0] as unknown[];
    const documentFactory = setupCall[2] as () => unknown;

    documentFactory();

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(mockApp, expect.any(Object));
  });
});
