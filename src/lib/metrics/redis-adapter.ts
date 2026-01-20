/**
 * Redis adapter interface for metrics storage.
 * Provides a unified interface for different Redis implementations.
 */
export interface RedisAdapter {
  /**
   * Increment multiple hash fields by specified amounts
   */
  hincrby(key: string, fields: Record<string, number>): Promise<void>;

  /**
   * Get all fields and values from a hash
   */
  hgetall(key: string): Promise<Record<string, number>>;

  /**
   * Set expiration time on a key (in seconds)
   */
  expire(key: string, seconds: number): Promise<void>;

  /**
   * Find all keys matching a pattern
   */
  keys(pattern: string): Promise<string[]>;

  /**
   * Delete one or more keys
   */
  del(...keys: string[]): Promise<void>;

  /**
   * Close the connection gracefully
   */
  close(): Promise<void>;
}

/**
 * No-op adapter that does nothing (used when metrics are disabled)
 */
export class NoopAdapter implements RedisAdapter {
  async hincrby(_key: string, _fields: Record<string, number>): Promise<void> {
    // No-op
  }

  async hgetall(_key: string): Promise<Record<string, number>> {
    return {};
  }

  async expire(_key: string, _seconds: number): Promise<void> {
    // No-op
  }

  async keys(_pattern: string): Promise<string[]> {
    return [];
  }

  async del(..._keys: string[]): Promise<void> {
    // No-op
  }

  async close(): Promise<void> {
    // No-op
  }
}
