import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health Module
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
