import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',

  // GraphQL settings
  graphql: {
    playground: process.env.NODE_ENV === 'development',
    introspection: process.env.NODE_ENV === 'development',
    path: '/graphql',
  },

  // CORS settings for frontend integration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },

  // API rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
}));
