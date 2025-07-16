import { registerAs } from '@nestjs/config';

/**
 * Redis configuration for caching and real-time features
 *
 * Used for:
 * 1. Session management
 * 2. Caching frequently accessed data
 * 3. Rate limiting (future feature)
 * 4. Real-time features (future feature)
 */
export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,

  // Redis connection options
  retryAttempts: 5,
  retryDelay: 1000,

  // TTL (Time To Live) settings for different types of cached data
  ttl: {
    default: 3600, // 1 hour
    userProfile: 1800, // 30 minutes
    posts: 600, // 10 minutes
    feed: 300, // 5 minutes
  },
}));
