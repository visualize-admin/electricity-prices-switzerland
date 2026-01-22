// Custom memoize with cache hit/miss logging
export const createMemoize = <
  T extends (...args: $IntentionalAny[]) => $IntentionalAny
>(
  fn: T,
  _label: string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
