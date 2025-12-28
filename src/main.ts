import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { setupSwagger } from './shared/utils/set-swagger';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  setupSwagger(app, {
    title: 'Conference Setter API',
    description: 'API documentation for the Conference Setter application',
    version: '1.0.0',
  });

  await app.listen(port);
}
bootstrap();
