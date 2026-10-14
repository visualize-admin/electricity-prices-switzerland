import { InMemoryLRUCache, KeyValueCache } from "@apollo/utils.keyvaluecache";
import Redis from "ioredis";

import serverEnv from "src/env/server";
import { redis, scanKeys } from "src/lib/redis";

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

// Errors count as misses: when Redis is unavailable, requests go uncached
// instead of failing. Connection errors are logged by the client.
const createRedisKeyValueCache = (redis: Redis): KeyValueCache<string> => ({
  get: async (key) => (await redis.get(key).catch(() => null)) ?? undefined,
  set: async (key, value, options) => {
    const ttl = options?.ttl ? Math.ceil(options.ttl) : undefined;
    await (ttl
      ? redis.set(key, value, "EX", ttl)
      : redis.set(key, value)
    ).catch(() => {});
  },
  delete: async (key) => (await redis.del(key).catch(() => 0)) > 0,
});

const memoryCache = new InMemoryLRUCache<string>();

export const graphqlCache: KeyValueCache<string> = redis
  ? createRedisKeyValueCache(redis)
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
      // Response cache keys only: the Redis also holds the shared caches
      scanKeys(redis, "fqc:*"),
      redis.info("memory"),
    ]);
    return {
      ...base,
      keys: keys.length,
      usedMemory: parseInfoField(memory, "used_memory_human"),
      maxMemory: parseInfoField(memory, "maxmemory_human"),
    };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : `${e}` };
  }
};
