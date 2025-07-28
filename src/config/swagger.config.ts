import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger Configuration
 *
 * This configuration sets up Swagger/OpenAPI documentation for REST endpoints.
 * While our main API is GraphQL, we'll use REST for:
 * - File uploads (images, videos)
 * - Webhooks
 * - Health checks
 * - Authentication endpoints (as alternatives to GraphQL)
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Social Media Platform API')
    .setDescription(
      `
      Social Media Platform REST API Documentation

      This API provides REST endpoints for specific functionality that complements
      our main GraphQL API. Use this for:

      - File uploads (images, videos)
      - Authentication (alternative to GraphQL)
      - Health checks and monitoring
      - Webhooks and third-party integrations

      For general data operations, use our GraphQL API at /graphql
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Posts', 'Post management endpoints')
    .addTag('Uploads', 'File upload endpoints')
    .addTag('Health', 'Health check endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps authorization when page refreshes
      displayRequestDuration: true,
      docExpansion: 'none', // Don't expand operations by default
      filter: true, // Enable search filter
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Social Media API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
  });

  // Also setup JSON endpoint for the OpenAPI specification
  SwaggerModule.setup('api/json', app, document);
}

/**
 * Swagger Configuration Object
 * This can be used if you need to access configuration programmatically
 */
export const swaggerConfig = {
  title: 'Social Media Platform API',
  description: 'REST API for Social Media Platform',
  version: '1.0',
  path: 'api/docs',
  jsonPath: 'api/json',
};
