import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Import our configuration files
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { HealthModule } from './modules/health/health.module';

/**
 * Root Application Module
 */
@Module({
  imports: [
    /**
     * ConfigModule - Handles environment variables and configuration
     * forRoot() makes it globally available throughout the application
     */
    ConfigModule.forRoot({
      // Make ConfigService available globally
      isGlobal: true,

      // Load our configuration files
      load: [databaseConfig, jwtConfig, redisConfig, appConfig],

      // Validate environment variables (optional)
      // validationSchema: configValidationSchema,

      // Load .env file
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

    /**
     * TypeOrmModule - Database ORM integration
     * forRootAsync() allows us to use ConfigService for configuration
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const config = configService.get<TypeOrmModuleOptions>(
          'database',
        ) as TypeOrmModuleOptions;

        return new Promise((resolve) => {
          resolve(config);
        });
      },
      inject: [ConfigService],
    }),

    /**
     * GraphQLModule - GraphQL API setup
     * forRootAsync() allows us to use ConfigService for configuration
     */
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // Auto-generate GraphQL schema from TypeScript classes
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),

        // Sort schema lexicographically
        sortSchema: true,

        // Enable GraphQL playground in development
        playground: configService.get('app.graphql.playground'),

        // Enable introspection in development
        introspection: configService.get('app.graphql.introspection'),

        // GraphQL path
        path: configService.get('app.graphql.path'),

        // Disable CSRF protection for development (allows playground to work)
        csrfPrevention: false,

        // Enable subscriptions for real-time features (future)
        subscriptions: {
          'graphql-ws': true,
        },

        // Context function - runs on every request
        // This is where we'll add authentication context
        context: ({ req, res }) => ({
          req,
          res,
        }),
      }),
      inject: [ConfigService],
    }),

    // Common modules
    HealthModule,

    // Feature modules:
    AuthModule,
    UsersModule,
    PostsModule,
    // FeedModule,
    // SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
