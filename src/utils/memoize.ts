// Custom memoize with cache hit/miss logging
export const createMemoize = <
  T extends (...args: $IntentionalAny[]) => $IntentionalAny
>(
  fn: T,
  label: string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // eslint-disable-next-line no-console
      console.log(`[${label}] Cache HIT`);
      return cache.get(key)!;
    }

    // eslint-disable-next-line no-console
    console.log(`[${label}] Cache MISS`);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
