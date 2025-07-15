# Agent Guide for SocialMediaPlatform-NestJS

## Build/Test/Lint Commands
- `npm run build` - Build the application
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests (Jest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run start:dev` - Start development server with hot reload

## Architecture & Structure
- **Framework**: NestJS with Express
- **Language**: TypeScript
- **Testing**: Jest for unit tests, Supertest for e2e
- **Structure**: Standard NestJS app structure in `src/` with modules, controllers, services
- **Entry point**: `src/main.ts`

## Code Style & Guidelines
- **Formatting**: Prettier with single quotes, trailing commas
- **Linting**: ESLint with TypeScript, allows `any` type, warns on floating promises
- **File naming**: Use `.spec.ts` for unit tests, `.e2e-spec.ts` for e2e tests
- **Imports**: Use ES6 imports, follow NestJS conventions
- **Types**: TypeScript strict mode, use proper typing
