/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Health Check Controller
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * Basic health check endpoint
   * This is useful for monitoring and load balancers
   */
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Returns the health status of the application and its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Uptime in seconds' },
        database: { type: 'string', example: 'connected' },
        redis: { type: 'string', example: 'connected' },
        elasticsearch: { type: 'string', example: 'connected' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Database connection failed' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected', // TODO: Add actual database health check
      redis: 'connected', // TODO: Add actual Redis health check
      elasticsearch: 'connected', // TODO: Add actual Elasticsearch health check
    };
  }

  /**
   * Simple ping endpoint for basic connectivity tests
   */
  @Get('ping')
  @ApiOperation({
    summary: 'Simple ping endpoint',
    description:
      'Returns a simple pong response for basic connectivity testing',
  })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'pong' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  ping() {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
