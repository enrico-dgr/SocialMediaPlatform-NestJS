# Social Media Platform Backend

## Project Overview

This project is a robust and scalable backend for a social media platform, designed to demonstrate advanced backend development practices using **NestJS**. It provides core functionalities found in popular social media applications, with a strong emphasis on performance, real-time capabilities, and efficient data management.

## Key Features

* **User Management:** Secure user registration, authentication (JWT), profile management, and account settings.
* **Post Creation & Interaction:** Create text-based posts, upload images/videos, like, comment, and share posts.
* **Follow System:** Users can follow and unfollow other users.
* **Personalized News Feed:** Dynamically generated news feed displaying posts from followed users and relevant content.
* **Search Functionality:** Efficiently search for users and posts using advanced indexing.
* **Real-time Updates:** (Planned/Future) Notifications for new likes, comments, and followers.
* **Scalability & Performance:** Built with caching and search optimization for handling large volumes of data and requests.

## Technologies Used

* **Backend Framework:** [NestJS](https://nestjs.com/) (TypeScript)
  * **Core Concepts:** Modules, Controllers, Services, Providers, Pipes, Guards, Interceptors, Custom Decorators.
  * **Advanced:** GraphQL, TypeORM, WebSockets (planned), Caching Module, Config Module, Validation Pipe.
* **Database:**
  * **Primary:** [PostgreSQL](https://www.postgresql.org/) (Relational Database) - for core user data, posts, comments, followers.
  * **Caching:** [Redis](https://redis.io/) - for session management, frequently accessed data (e.g., popular posts, user profiles), and rate limiting.
* **ORM:** [TypeORM](https://typeorm.io/) - Seamlessly interacts with PostgreSQL, providing powerful ORM capabilities.
* **Search Engine:** [Elasticsearch](https://www.elastic.co/elasticsearch/) - For lightning-fast and flexible full-text search on users and posts.
* **API Layer:** [GraphQL](https://graphql.org/) - Provides a flexible and efficient way for clients to query exactly the data they need, reducing over-fetching and under-fetching.
* **Authentication:** [Passport.js](http://www.passportjs.org/) with JWT (JSON Web Tokens) strategies.
* **Validation:** [Class Validator](https://github.com/typestack/class-validator) & [Class Transformer](https://github.com/typestack/class-transformer).
* **Testing:** [Jest](https://jestjs.io/) (Unit, Integration, E2E tests).
* **Environment Management:** [Dotenv](https://www.npmjs.com/package/dotenv).
* **Deployment (Example):** Docker, AWS EC2 / Google Cloud Run (or similar cloud platform).

## Architecture & Advanced NestJS Concepts Demonstrated

This project is designed to showcase the following advanced NestJS and architectural patterns:

1. **GraphQL API:**

      * Implementation of a comprehensive GraphQL schema with various queries, mutations, and potentially subscriptions (for real-time updates like notifications).
      * Leveraging NestJS `@nestjs/graphql` module with Apollo Server for robust API development.
      * Type-safe GraphQL resolvers using `class-validator` for input validation.

2. **Robust Authentication & Authorization:**

      * **JWT-based Authentication:** Secure user login and protected routes using Passport.js with JWT strategy.
      * **Role-Based Access Control (RBAC):** (If applicable, e.g., for admin functionalities) Demonstrating custom guards and decorators to restrict access based on user roles.

3. **Caching with Redis:**

      * **`@nestjs/cache-manager`:** Integration of NestJS's built-in caching module with Redis.
      * **Strategic Caching:** Caching frequently accessed data like user profiles, popular posts, or configuration settings to reduce database load and improve response times.
      * **Cache Invalidation:** Implementing strategies to invalidate cached data upon updates (e.g., when a user updates their profile, their cached profile is removed).

4. **Elasticsearch Integration for Search:**

      * **Dedicated Search Module/Service:** A dedicated module responsible for indexing data into Elasticsearch and performing search queries.
      * **Data Synchronization:** Mechanisms (e.g., using TypeORM event listeners, message queues, or cron jobs) to keep Elasticsearch indices synchronized with the PostgreSQL database.
      * **Complex Search Queries:** Demonstrating fuzzy search, filtering, and aggregation capabilities of Elasticsearch for user and post search.

5. **Clean Architecture & Modularity:**

      * Strict adherence to NestJS's modular structure, ensuring clear separation of concerns (e.g., `UsersModule`, `PostsModule`, `AuthModule`, `SearchModule`, `FeedModule`).
      * Layered architecture (Controllers, Services, Repositories, Entities) for maintainability and testability.

6. **Asynchronous Operations & Background Jobs:**

      * **Image/Video Processing (Placeholder):** While not fully implemented, the design allows for integration with message queues (e.g., RabbitMQ, Kafka) and dedicated microservices or background job runners (e.g., BullMQ) for media processing. This can be discussed as a future enhancement.
      * **Feed Generation Algorithms:** While initially simple, the feed service can evolve to incorporate more complex algorithms, potentially running as background tasks.

7. **Comprehensive Testing:**

      * **Unit Tests:** For individual services and utility functions.
      * **Integration Tests:** For testing interactions between modules and database operations.
      * **End-to-End Tests:** Simulating real user flows through the API using Supertest.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn
* Docker & Docker Compose (highly recommended for easy setup of PostgreSQL, Redis, and Elasticsearch)

### 1\. Clone the repository

```bash
git clone https://github.com/your-username/social-media-backend.git
cd social-media-backend
```

### 2\. Environment Variables

Create a `.env` file in the root directory of the project based on `.env.example`.

```dotenv
# Database Configuration (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=social_media_db

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic # If using security
ELASTICSEARCH_PASSWORD=changeme # If using security

# Other
PORT=3000
```

**Important:** Replace placeholder values with your actual desired credentials. For Elasticsearch, if you're running it without security (common for local development), you might not need `ELASTICSEARCH_USERNAME` and `ELASTICSEARCH_PASSWORD`.

### 3\. Start Services with Docker Compose

This project uses Docker Compose to easily spin up PostgreSQL, Redis, and Elasticsearch.

```bash
docker-compose up -d
```

This command will:

* Pull necessary Docker images (PostgreSQL, Redis, Elasticsearch).
* Create and start containers for these services.
* Expose their default ports (5432 for PostgreSQL, 6379 for Redis, 9200 and 9300 for Elasticsearch).

### 4\. Install Dependencies

```bash
npm install # or yarn install
```

### 5\. Run Database Migrations

Apply TypeORM migrations to set up your database schema:

```bash
npm run typeorm migration:run # or yarn typeorm migration:run
```

### 6\. Start the Application

```bash
npm run start:dev # or yarn start:dev
```

The application will be running at `http://localhost:3000`.
The GraphQL Playground will typically be available at `http://localhost:3000/graphql`.

## API Endpoints (GraphQL)

Access the GraphQL Playground at `http://localhost:3000/graphql` to explore the schema and interact with the API.

### Example Queries & Mutations

**User Registration:**

```graphql
mutation RegisterUser {
  register(input: {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "Password123!"
  }) {
    id
    username
    email
  }
}
```

**User Login:**

```graphql
mutation LoginUser {
  login(input: {
    email: "john.doe@example.com",
    password: "Password123!"
  }) {
    accessToken
    user {
      id
      username
    }
  }
}
```

**Create Post:** (Requires Authorization Header: `Bearer <your_access_token>`)

```graphql
mutation CreatePost {
  createPost(input: {
    content: "My first post on this new social media platform!",
    imageUrl: "https://example.com/image.jpg"
  }) {
    id
    content
    createdAt
    author {
      username
    }
  }
}
```

**Fetch News Feed:** (Requires Authorization Header)

```graphql
query GetFeed {
  feed(offset: 0, limit: 10) {
    id
    content
    createdAt
    author {
      username
    }
    likesCount
    commentsCount
  }
}
```

**Search Users:**

```graphql
query SearchUsers {
  searchUsers(query: "john") {
    id
    username
    email
  }
}
```

**Search Posts:**

```graphql
query SearchPosts {
  searchPosts(query: "first post") {
    id
    content
    author {
      username
    }
  }
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## Future Enhancements / Ideas

* **Real-time Notifications:** Implement WebSockets for instant notifications (likes, comments, new followers).
* **Direct Messaging:** Add one-on-one and group chat functionalities.
* **Image/Video Processing Microservice:** Integrate with a dedicated service (e.g., using AWS S3 and Lambda or similar) for efficient media handling.
* **Recommendation Engine:** Develop algorithms to suggest users to follow or posts to view.
* **Metrics & Monitoring:** Integrate with Prometheus/Grafana for monitoring application performance.
* **Container Orchestration:** Deploy with Kubernetes for advanced scaling and management.

## Contributing

Contributions are welcome\! Please fork the repository and submit pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
