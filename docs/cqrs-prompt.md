# Task: Add CQRS to my existing Node.js API — PostgreSQL as Write DB, MongoDB as Read DB

## Your role
Act as a senior software architect. Design AND implement CQRS (Command Query Responsibility Segregation) in my existing codebase. Give me a step-by-step implementation plan first, then complete production-quality code, module by module. Ask me nothing unless something is truly blocking; state reasonable assumptions explicitly.

## My current stack (all already working)
- Runtime: Node.js, TypeScript, strict mode, ESM ("type": "module" — all relative imports MUST end in .js)
- HTTP: Fastify 5, plugins: @fastify/cors, @fastify/helmet, @fastify/rate-limit
- ORM (write side): Prisma 7 + @prisma/adapter-pg (PostgreSQL 17) — Prisma 7 does NOT support MongoDB, so the read side must use the native `mongodb` npm driver (or explain why another choice is better)
- Messaging: RabbitMQ 4 (amqplib), topic exchange "enterprise.events", persistent messages with messageId property
- Reliable messaging ALREADY IMPLEMENTED: transactional outbox (OutboxMessage table + OutboxWorker polling batch of 10 with exponential backoff, publishes to "enterprise.events") and inbox idempotency table (InboxMessage, used by consumers to dedupe by messageId)
- Cache: Redis 6 (node-redis client)
- Auth: jose HS256 JWTs (access/refresh/reset), argon2 password hashing, DB-backed refresh-token sessions with rotation, RBAC (roles/permissions tables + permissionGuard preHandler hook + Redis-cached authorization)
- Validation: Zod schemas applied manually in controllers
- Errors: AppError hierarchy (NotFound/Conflict/Unauthorized/Forbidden/ValidationError...) mapped by a global error handler into { data, error: { code, message }, meta } envelopes; success responses wrapped as { data, meta } by an onSend hook
- Logging: pino via ILogger interface
- DI: hand-rolled composition root (container.ts) — no framework

## My current structure (Clean Architecture — preserve it)

apps/api/src/
  server.ts            # bootstrap: permission sync → rabbitmq connect → workers → listen(env.PORT)
  app.ts               # createApp(): parsers, plugins, routes under /v1
  container.ts         # manual DI composition root (~480 lines)
  plugins/             # cors, security(helmet), rateLimit, redis, errorHandler, requestMeta, responseMeta, swagger
  hooks/               # authenticate.ts (Bearer→request.userId), permissionGuard.ts (resource:action RBAC)
  controllers/         # AuthController, UserController, RoleController, UserRoleController, RolePermissionController, PermissionController
  routes/v1/           # authRoutes, userRoutes, meRoutes, roleRoutes, userRoleRoutes, rolePermissionRoutes, permissionRoutes

src/
  application/
    services/          # interfaces + impls: IPasswordHasher, ITokenService, IOtpService, IEmailService,
                       # IMessagePublisher, IUnitOfWork (+PrismaUnitOfWork $transaction w/ tx-scoped repos),
                       # authorization/* (PermissionRegistry, PermissionSynchronizer, AuthorizationService w/ Redis cache-aside),
                       # outbox/OutboxWorker
    use-cases/         # auth/* (RegisterUser, LoginUser, RefreshToken, Logout, VerifyEmail, ForgotPassword flow...),
                       # users/*, roles/*, userRoles/*, rolePermissions/*
    dto/, mappers/, validation/ (zod), context/, events/AuthEvents.ts (AUTH_EVENTS.USER_REGISTERED = "user.registered")
  domain/
    entities/          # User, Role, Permission, RefreshTokenSession, PendingLogin
    repositories/      # IUserRepository, IRoleRepository, IPermissionRepository, IUserRoleRepository,
                       # IRolePermissionRepository, IRefreshTokenSessionRepository, ITrustedDeviceRepository, ...
  infrastructure/
    database/prisma/   # PrismaClient.ts (PrismaPg adapter), PrismaUnitOfWork.ts
    repositories/      # PrismaXxxRepository implementing domain interfaces (map rows→domain entities)
    messaging/rabbitmq/# rabbitmqClient, RabbitMQPublisher, WelcomeEmailConsumer (inbox-deduped), EmailJobQueue, EmailWorker
    redis/             # redisClient + stores (registration, password-reset, pending-login, authorization cache)
    email/, logging/PinoLogger.ts, config/env.ts (zod-validated env incl. PORT, TRUST_PROXY, CORS_ORIGINS, JWT secrets >=32 chars)
  shared/              # errors/AppError hierarchy, http/ApiResponseBuilder+ApiVersion+ApiMeta, logging/ILogger, time/AppTimeZone

## Domain model (write side, PostgreSQL via Prisma)
- User (id uuid, email unique, name, passwordHash, emailVerifiedAt, deletedAt soft-delete)
- Role (id uuid, name unique), Permission (id, resource, action), UserRole, RolePermission (join tables)
- RefreshTokenSession (tokenId unique, revokedAt, replacedByTokenId, deviceInfo, ipAddress)
- TrustedDevice (userId, deviceHash, trustedUntil)
- OutboxMessage (status enum PENDING/PROCESSING/PUBLISHED/FAILED, attempts)
- InboxMessage (messageId unique)

## What I want you to build (CQRS requirements)
1. COMMAND SIDE stays entirely on the existing PostgreSQL + Prisma stack. All writes go through existing use cases + UnitOfWork. No changes to write logic except emitting events (see below).
2. READ SIDE moves to MongoDB (new database, e.g. "enterprise_read"). Queries are served from purpose-built denormalized read models — NOT from normalized tables. Use the native mongodb driver with a typed thin wrapper (no heavy ODM unless you strongly justify it).
3. SYNC MECHANISM: extend the existing transactional outbox. Every state-changing use case must insert an integration event into OutboxMessage in the SAME transaction as its writes. Define an event catalog (e.g. user.registered, user.updated, user.deleted, role.created, role.updated, role.deleted, user.role-assigned, user.role-removed, role.permission-assigned, role.permission-removed) with versioned payload schemas (zod).
4. PROJECTION WORKER: a new consumer subscribes to "enterprise.events" and applies events idempotently to MongoDB read models (dedupe by messageId/eventId — reuse the inbox idea). Handle out-of-order/duplicate events using aggregate version numbers carried in event payloads.
5. READ MODELS to design (denormalized, query-shaped):
   - users_view: user profile + role names/permissions flattened for listing & detail screens (supports pagination, search by name/email, filter by role)
   - roles_view: role + its permission codes
   - Optionally user_audit_view if useful for login/session flows
6. QUERY SIDE CODE SHAPE: new domain/application abstractions, e.g. IUsersReadRepository (list/get/search with pagination metadata) implemented by MongoUsersReadRepository in infrastructure. New query use cases (GetAllUsersQuery etc.) that BYPASS the write-side repositories. Controllers/routes split cleanly: mutating endpoints -> command use cases; GET/list/search endpoints -> query use cases reading Mongo.
7. EVENTUAL CONSISTENCY: document where staleness is acceptable and where not (e.g. after register, before login reads). Where needed, fall back to read-your-writes from Postgres or wait-for-projection strategies. Include aggregate `version` in both read models and events.
8. REBUILDABILITY: projections must be rebuildable from scratch (drop collections -> replay all outbox/history events). Provide a replay script.
9. INFRASTRUCTURE: Mongo connection lifecycle wired like the Redis plugin (connect at boot, onClose quit); env vars MONGODB_URL/MONGODB_DB validated in config/env.ts; health check extended to report Mongo status; graceful shutdown ordering (stop consumers -> close amqp/mongo/redis/pg).
10. PRESERVE ALL EXISTING CONVENTIONS: response envelopes, AppError mapping, zod validation in controllers, RBAC guards on admin routes, pino logging via ILogger, .js ESM import suffixes, repository-maps-to-entity style, no comments unless essential.

## Deliverables (in this order)
A. Architecture diagram (text/ASCII) of the final flow:
   Controller -> Command UseCase -> Prisma tx (writes + outbox insert) -> OutboxWorker -> RabbitMQ -> Projection Worker -> MongoDB <- Query UseCase <- Controller
B. File-by-file implementation plan (paths matching MY structure above)
C. Full code for each new/changed file: env additions, Mongo client + plugin, event definitions + zod schemas, outbox-writing changes in each affected use case (show RegisterUser and at least one RBAC mutation fully), ProjectionWorker consumer with idempotency + version checks, Mongo read repositories + indexes to create, query use cases, updated controllers/routes/container.ts wiring
D. Migration/runbook: npm deps to install, docker-compose addition for mongo, index creation script, projection rebuild/replay commands, rollout order (shadow-run projections before switching reads)
E. Testing checklist: eventual-consistency test steps, idempotency test, out-of-order event test, rebuild test
F. Trade-offs section: what this adds operationally, failure modes (projection lag, poison messages -> DLQ), and when CQRS here is overkill

Do not simplify away the outbox/inbox reliability work that already exists — build ON it. Start with A and B now.
