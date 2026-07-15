import { bool, cleanEnv, num, port, str, url } from 'envalid';

/**
 * @fileoverview Application environment variables validation schema.
 * Ensures the application fails fast during startup if any critical configuration is missing.
 */

// ============================================
// ENV VARIABLES VALIDATION (Fail-Fast)
// ============================================
export const config = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'production', 'test'],
        default: 'development',
    }),
    LOG_LEVEL: str({
        choices: ['debug', 'info', 'warn', 'error'],
        default: 'debug',
    }),
    CORS_ORIGIN: str({ default: 'http://localhost:5173' }),
    SERVER_HOSTNAME: str({ default: '0.0.0.0' }),
    SERVER_PORT: port({ default: 8080 }),

    DATABASE_URL: url({ desc: 'PostgreSQL connection string' }),
    DB_POOL_MAX: num({ default: 10 }),
    DB_POOL_IDLE_TIMEOUT: num({ default: 30000 }),
    DB_POOL_CONNECTION_TIMEOUT: num({ default: 5000 }),
    REDIS_URL: url({ default: 'redis://localhost:6379' }),
    JWT_SECRET: str({ desc: 'Secret for signing JWT tokens' }),
    ENABLE_OPENAPI: bool({ default: true }),
});