import { Redis as UpstashRedis } from "@upstash/redis";
import IoRedis from "ioredis";
import { RedisAdapter, NoopAdapter } from "./redis-adapter";
import { UpstashAdapter } from "./upstash-adapter";
import { IoredisAdapter } from "./ioredis-adapter";

let redisAdapter: RedisAdapter | null = null;

/**
 * Initializes and returns a Redis adapter based on environment configuration.
 *
 * Connection priority:
 * 1. Upstash (if UPSTASH_REDIS_REST_URL is set)
 * 2. Local Redis (if REDIS_URL is set)
 * 3. No-op adapter (metrics disabled)
 */
export function getRedisClient(): RedisAdapter {
  // Return cached adapter if available
  if (redisAdapter !== null) {
    return redisAdapter;
  }

  // Check if metrics are enabled
  if (process.env.METRICS_ENABLED !== "true") {
    console.info("[Metrics] METRICS_ENABLED is not true - using no-op adapter");
    redisAdapter = new NoopAdapter();
    return redisAdapter;
  }

  // Try Upstash first
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const upstashClient = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      redisAdapter = new UpstashAdapter(upstashClient);
      console.info("[Metrics] Connected to Upstash Redis");
      return redisAdapter;
    } catch (error) {
      console.error("[Metrics] Failed to connect to Upstash:", error);
    }
  }

  // Try local Redis
  if (process.env.REDIS_URL) {
    try {
      const ioredisClient = new IoRedis(process.env.REDIS_URL, {
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

      redisAdapter = new IoredisAdapter(ioredisClient);
      console.info("[Metrics] Connected to Redis via REDIS_URL");
      return redisAdapter;
    } catch (error) {
      console.error("[Metrics] Failed to connect to Redis:", error);
    }
  }

  // Fall back to no-op adapter
  console.info("[Metrics] No Redis connection available - using no-op adapter");
  redisAdapter = new NoopAdapter();
  return redisAdapter;
}

/**
 * Gracefully closes the Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisAdapter) {
    await redisAdapter.close();
    console.info("[Metrics] Redis connection closed");
  }
  redisAdapter = null;
}
