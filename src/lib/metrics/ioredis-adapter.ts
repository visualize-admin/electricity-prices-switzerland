import Redis from "ioredis";

import { RedisAdapter } from "./redis-adapter";

/**
 * ioredis adapter implementation
 */
export class IoredisAdapter implements RedisAdapter {
  constructor(private client: Redis) {}

  async hincrby(key: string, fields: Record<string, number>): Promise<void> {
    // Use pipeline for atomic increments
    const pipeline = this.client.pipeline();

    for (const [field, value] of Object.entries(fields)) {
      pipeline.hincrby(key, field, value);
    }

    await pipeline.exec();
  }

  async hgetall(key: string): Promise<Record<string, number>> {
    const result = await this.client.hgetall(key);

    // Convert string values to numbers
    const numericResult: Record<string, number> = {};
    for (const [field, value] of Object.entries(result)) {
      numericResult[field] = parseInt(value, 10);
    }

    return numericResult;
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
    await this.client.quit();
  }
}
