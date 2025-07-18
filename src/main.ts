import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService to access our configuration
  const configService = app.get(ConfigService);

  // Set up global validation pipe
  // This automatically validates all incoming requests using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      // Remove properties that are not defined in the DTO
      whitelist: true,

      // Throw error if non-whitelisted properties are provided
      forbidNonWhitelisted: true,

      // Automatically transform payloads to match DTO types
      transform: true,

      // Transform primitive types (string to number, etc.)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure CORS for frontend integration
  app.enableCors(configService.get('app.cors'));

  // Setup Swagger documentation (only in development)
  if (configService.get('app.environment') !== 'production') {
    setupSwagger(app);
  }

  // Get port from configuration
  const port = configService.get<number>('app.port') as number;

  // Start the server
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `GraphQL Playground available at: http://localhost:${port}/graphql`,
  );

  // Only show Swagger URL in development
  if (configService.get('app.environment') === 'development') {
    console.log(
      `Swagger API Documentation available at: http://localhost:${port}/api/docs`,
    );
  }
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
