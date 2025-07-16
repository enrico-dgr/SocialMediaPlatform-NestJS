import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from 'src/database/entities';

export default registerAs<TypeOrmModuleOptions>(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'social_media_db',

    // In development, we'll use synchronize: true to auto-create tables
    // In production, you should use migrations instead
    synchronize: process.env.NODE_ENV !== 'production',

    // Log SQL queries in development
    logging: process.env.NODE_ENV === 'development',

    entities,

    // Connection pool settings for better performance
    extra: {
      max: 10, // Maximum number of connections
      min: 2, // Minimum number of connections
    },
  }),
);
