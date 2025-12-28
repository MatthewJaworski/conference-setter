import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export type SwaggerConfig = {
  title: string;
  description: string;
  version: string;
};

export function setupSwagger(app: INestApplication, config: SwaggerConfig): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, documentFactory);
}
