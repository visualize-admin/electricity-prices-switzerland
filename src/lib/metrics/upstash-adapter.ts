import { Redis } from "@upstash/redis";
import { RedisAdapter } from "./redis-adapter";

/**
 * Upstash Redis adapter implementation
 */
export class UpstashAdapter implements RedisAdapter {
  constructor(private client: Redis) {}

  async hincrby(key: string, fields: Record<string, number>): Promise<void> {
    // Upstash doesn't have hincrby in pipeline, so we do sequential increments
    // then set expiration
    for (const [field, value] of Object.entries(fields)) {
      await this.client.hincrby(key, field, value);
    }
  }

  async hgetall(key: string): Promise<Record<string, number>> {
    const result = await this.client.hgetall<Record<string, number>>(key);
    return result || {};
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async close(): Promise<void> {
    // Upstash REST API doesn't need explicit connection closing
  }
}
