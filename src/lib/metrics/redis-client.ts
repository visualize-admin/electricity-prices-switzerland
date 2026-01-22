import { Redis as UpstashRedis } from "@upstash/redis";
import IoRedis from "ioredis";

import serverEnv from "src/env/server";

import { IoredisAdapter } from "./ioredis-adapter";
import { RedisAdapter, NoopAdapter } from "./redis-adapter";
import { UpstashAdapter } from "./upstash-adapter";

type RedisClientOptions = 
  | { type: 'noop' }
  | { type: 'upstash'; url: string; token: string }
  | { type: 'ioredis'; url: string };

/**
 * Parses Redis configuration options from environment variables.
 *
 * Priority:
 * 1. Upstash (if both URL and token are provided)
 * 2. Local Redis (if REDIS_URL is provided)
 * 3. No-op adapter (if metrics disabled or no connection info)
 */
function parseRedisOptionsFromEnv(): RedisClientOptions {
  if (!serverEnv.METRICS_ENABLED) {
    return { type: 'noop' };
  }

  if (serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN) {
    return { 
      type: 'upstash', 
      url: serverEnv.UPSTASH_REDIS_REST_URL, 
      token: serverEnv.UPSTASH_REDIS_REST_TOKEN 
    };
  }

  if (serverEnv.REDIS_URL) {
    return { type: 'ioredis', url: serverEnv.REDIS_URL };
  }

  return { type: 'noop' };
}

/**
 * Creates a Redis adapter based on the provided options.
 */
function createRedisClient(options: RedisClientOptions): RedisAdapter {
  switch (options.type) {
    case 'noop':
      console.info("[Metrics] Using no-op adapter - metrics disabled");
      return new NoopAdapter();

    case 'upstash':
      try {
        const upstashClient = new UpstashRedis({
          url: options.url,
          token: options.token,
        });
        console.info("[Metrics] Connected to Upstash Redis");
        return new UpstashAdapter(upstashClient);
      } catch (error) {
        console.error("[Metrics] Failed to connect to Upstash:", error);
        console.info("[Metrics] Falling back to no-op adapter");
        return new NoopAdapter();
      }

    case 'ioredis':
      try {
        const ioredisClient = new IoRedis(options.url, {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            if (times > 3) {
              console.error("[Metrics] Redis connection failed after 3 retries");
              return null;
            }
            return Math.min(times * 50, 2000);
          },
        });

        ioredisClient.on("error", (error) => {
          console.error("[Metrics] Redis error:", error);
        });

        console.info("[Metrics] Connected to Redis via REDIS_URL");
        return new IoredisAdapter(ioredisClient);
      } catch (error) {
        console.error("[Metrics] Failed to connect to Redis:", error);
        console.info("[Metrics] Falling back to no-op adapter");
        return new NoopAdapter();
      }

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = options;
      return _exhaustive;
  }
}

let redisAdapter: RedisAdapter | null = null;

/**
 * Initializes and returns a Redis adapter based on environment configuration.
 */
export function getRedisClient(): RedisAdapter {
  // Return cached adapter if available
  if (redisAdapter !== null) {
    return redisAdapter;
  }

  const options = parseRedisOptionsFromEnv();
  redisAdapter = createRedisClient(options);
  return redisAdapter;
}

/**
 * Gracefully closes the Redis connection
 */
async function closeRedisConnection(): Promise<void> {
  if (redisAdapter) {
    await redisAdapter.close();
    console.info("[Metrics] Redis connection closed");
  }
  redisAdapter = null;
}
