import Redis from "ioredis";
import { LRUCache } from "typescript-lru-cache";

import { redis, scanKeys } from "src/lib/redis";

/**
 * Key-value cache stored in Redis when REDIS_URL is set, so that all
 * instances (and the instrumentation warmup) share it, and in an in-memory
 * LRU per module instance otherwise.
 *
 * With Redis, values go through JSON (Maps included). Redis failures and values
 * that do not parse count as misses.
 */
export type CacheBackend = "redis" | "memory";

export type SharedCache<T> = {
  namespace: string;
  backend: CacheBackend;
  // Method syntax, so that a SharedCache<string> is also a SharedCache<unknown>
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
};

type Options = {
  namespace: string;
  ttlMs: number;
  /** Memory backend only. Redis evicts with its own policy (allkeys-lru) */
  maxSize?: number;
};

const replacer = (_key: string, value: unknown) =>
  value instanceof Map ? { __map: [...value.entries()] } : value;

const reviver = (_key: string, value: unknown) =>
  value && typeof value === "object" && "__map" in value
    ? new Map(value.__map as [unknown, unknown][])
    : value;

const createMemoryCache = <T>({
  namespace,
  ttlMs,
  maxSize,
}: Options): SharedCache<T> => {
  const cache = new LRUCache<string, T>({
    entryExpirationTimeInMS: ttlMs,
    maxSize,
  });
  return {
    namespace,
    backend: "memory",
    get: async (key) => cache.get(key) ?? undefined,
    set: async (key, value) => {
      cache.set(key, value);
    },
    clear: async () => cache.clear(),
    size: async () => cache.size,
  };
};

const createRedisCache = <T>(
  redis: Redis,
  { namespace, ttlMs }: Options
): SharedCache<T> => {
  const prefix = `cache:${namespace}:`;

  return {
    namespace,
    backend: "redis",
    get: async (key) => {
      const json = await redis.get(prefix + key).catch(() => null);
      if (json === null) {
        return undefined;
      }
      try {
        return JSON.parse(json, reviver);
      } catch {
        return undefined;
      }
    },
    set: async (key, value) => {
      await redis
        .set(prefix + key, JSON.stringify(value, replacer), "PX", ttlMs)
        .catch(() => {});
    },
    clear: async () => {
      const keys = await scanKeys(redis, `${prefix}*`);
      if (keys.length > 0) {
        await redis.unlink(...keys);
      }
    },
    size: async () => (await scanKeys(redis, `${prefix}*`)).length,
  };
};

export const createSharedCache = <T>(options: Options): SharedCache<T> =>
  redis ? createRedisCache<T>(redis, options) : createMemoryCache<T>(options);
