import {
  ErrorsAreMissesCache,
  InMemoryLRUCache,
  KeyValueCache,
} from "@apollo/utils.keyvaluecache";
import Redis from "ioredis";

import serverEnv from "src/env/server";

/**
 * Apollo cache backing the GraphQL response cache. Uses Redis when REDIS_URL
 * is set, so that all instances share it, and an in-memory LRU per instance
 * otherwise.
 */

export type GraphqlCacheInfo =
  | { backend: "memory"; keys: number }
  | {
      backend: "redis";
      host: string;
      status: string;
      keys?: number;
      usedMemory?: string;
      maxMemory?: string;
      error?: string;
    };

const createRedisClient = (url: string) => {
  const redis = new Redis(url, {
    // Fail fast while disconnected, so that requests skip the cache instead
    // of waiting for Redis to come back
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    commandTimeout: 1000,
  });
  let lastError: string | undefined;
  redis.on("error", (e: Error) => {
    if (e.message !== lastError) {
      console.warn(`[graphql-cache] Redis error: ${e.message}`);
      lastError = e.message;
    }
  });
  redis.on("ready", () => {
    lastError = undefined;
  });
  return redis;
};

const createRedisKeyValueCache = (redis: Redis): KeyValueCache<string> => ({
  get: async (key) => (await redis.get(key)) ?? undefined,
  set: async (key, value, options) => {
    if (options?.ttl) {
      await redis.set(key, value, "EX", Math.ceil(options.ttl));
    } else {
      await redis.set(key, value);
    }
  },
  delete: async (key) => (await redis.del(key)) > 0,
});

const redis = serverEnv.REDIS_URL
  ? createRedisClient(serverEnv.REDIS_URL)
  : undefined;
const memoryCache = new InMemoryLRUCache<string>();

export const graphqlCache: KeyValueCache<string> = redis
  ? new ErrorsAreMissesCache(createRedisKeyValueCache(redis))
  : memoryCache;

const parseInfoField = (info: string, field: string) =>
  info.match(new RegExp(`^${field}:(.*)$`, "m"))?.[1]?.trim();

export const getGraphqlCacheInfo = async (): Promise<GraphqlCacheInfo> => {
  if (!redis || !serverEnv.REDIS_URL) {
    return { backend: "memory", keys: memoryCache.keys().length };
  }
  const { host, port } = new URL(serverEnv.REDIS_URL);
  const base = {
    backend: "redis" as const,
    host: `${host || "localhost"}${port ? "" : ":6379"}`,
    status: redis.status,
  };
  try {
    const [keys, memory] = await Promise.all([
      redis.dbsize(),
      redis.info("memory"),
    ]);
    return {
      ...base,
      keys,
      usedMemory: parseInfoField(memory, "used_memory_human"),
      maxMemory: parseInfoField(memory, "maxmemory_human"),
    };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : `${e}` };
  }
};
