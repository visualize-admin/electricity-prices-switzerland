import Redis from "ioredis";

import serverEnv from "src/env/server";

/**
 * Redis client for the caches, undefined when REDIS_URL is not set.
 */

const createRedisClient = (url: string) => {
  const redis = new Redis(url, {
    // Fail fast while disconnected, so that requests skip the cache instead
    // of waiting for Redis to come back
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    commandTimeout: 1000,
  });
  let lastError: string | undefined;
  redis.on("error", (e: NodeJS.ErrnoException) => {
    // Connection errors such as ECONNREFUSED have an empty message
    const message = e.message || e.code || `${e}`;
    if (message !== lastError) {
      console.warn(`[redis] Redis error: ${message}`);
      lastError = message;
    }
  });
  redis.on("ready", () => {
    lastError = undefined;
  });
  return redis;
};

export const redis = serverEnv.REDIS_URL
  ? createRedisClient(serverEnv.REDIS_URL)
  : undefined;

/** Keys matching a SCAN pattern, without blocking Redis like KEYS would */
export const scanKeys = async (redis: Redis, match: string) => {
  const keys: string[] = [];
  for await (const batch of redis.scanStream({ match, count: 1000 })) {
    keys.push(...(batch as string[]));
  }
  return keys;
};
