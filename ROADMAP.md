# Social Media Platform Backend - Roadmap

This roadmap outlines the planned development and future enhancements for the social media backend. Items will be checked off as they are completed.

## Core Functionality & Setup (Completed/Initial Setup)

* [x] Project Initialization & Basic NestJS Setup
  * [x] Install NestJS CLI
  * [x] Create New NestJS Project
  * [x] Verify Basic Setup (App Module, Controller, Service)
* [X] Database Setup (PostgreSQL)
* [X] ORM Integration (TypeORM)
* [X] API Layer (GraphQL)
* [x] User Management Module
  * [x] User Registration
  * [x] User Authentication (JWT)
  * [x] Profile Management
  * [x] Account Settings
* [x] Post Creation & Interaction
  * [x] Create Text-Based Posts
  * [x] Like Posts
  * [x] Comment on Posts
  * [ ] Share Posts
* [x] Follow System
  * [x] Users can follow other users
  * [x] Users can unfollow other users
* [ ] Personalized News Feed
  * [ ] Dynamically generated news feed
  * [ ] Display posts from followed users
  * [ ] Display relevant content
* [ ] Search Functionality
  * [ ] Search for users
  * [ ] Search for posts
* [ ] Caching with Redis
* [ ] Search Engine Integration (Elasticsearch)
* [ ] Authentication with Passport.js and JWT
* [ ] Validation with Class Validator & Class Transformer
* [ ] Testing Framework (Jest) Setup
* [ ] Environment Management (Dotenv)
* [ ] Docker Compose Setup for PostgreSQL, Redis, Elasticsearch

## Advanced Features & Architectural Enhancements

* [x] Real-time Updates
  * [x] Notifications for new likes
  * [x] Notifications for new comments
  * [x] Notifications for new followers
  * [x] Implement WebSockets for instant notifications
  * [x] Offline notification handling on login/reconnection
* [x] Direct Messaging
  * [x] One-on-one chat functionalities
  * [x] Real-time messaging with WebSockets
  * [x] Message history and persistence
  * [x] Typing indicators
  * [x] Read receipts
  * [x] Chat UI with conversation list
* [ ] Scalability & Performance Improvements
  * [ ] Caching implementation
  * [ ] Search optimization
* [ ] Robust Authentication & Authorization
  * [ ] Role-Based Access Control (RBAC)
    * [ ] Custom guards and decorators for access restriction
* [ ] Caching with Redis
  * [ ] Strategic Caching (e.g., user profiles, popular posts)
  * [ ] Cache Invalidation strategies
* [ ] Elasticsearch Integration for Search
  * [ ] Dedicated Search Module/Service
  * [ ] Data Synchronization mechanisms (e.g., TypeORM event listeners)
  * [ ] Complex Search Queries (fuzzy search, filtering, aggregation)
* [ ] Clean Architecture & Modularity
  * [ ] Strict adherence to NestJS modular structure
  * [ ] Layered architecture (Controllers, Services, Repositories, Entities)
* [ ] Asynchronous Operations & Background Jobs
  * [ ] Image/Video Processing Microservice Integration [cite: 49, 118]
    * [ ] Integration with message queues (e.g., RabbitMQ, Kafka)
    * [ ] Integration with background job runners (e.g., BullMQ)
  * [ ] Feed Generation Algorithms
    * [ ] Evolve feed service for more complex algorithms
    * [ ] Implement as background tasks
* [ ] Comprehensive Testing
  * [ ] Unit Tests
  * [ ] Integration Tests
  * [ ] End-to-End Tests

## Future Enhancements / Ideas

* [ ] Group Messaging
  * [ ] Group chat functionalities
  * [ ] Group management (add/remove members)
  * [ ] Group admin features
* [ ] Recommendation Engine
  * [ ] Algorithms to suggest users to follow
  * [ ] Algorithms to suggest posts to view
* [ ] Metrics & Monitoring
  * [ ] Integrate with Prometheus/Grafana
* [ ] Container Orchestration
  * [ ] Deploy with Kubernetes
