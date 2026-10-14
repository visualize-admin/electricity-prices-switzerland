/**
 * Concurrent calls with the same key share one pending promise, so that
 * simultaneous cache misses in this process run one computation. The key is
 * released when the promise settles, so a failed computation is retried.
 */
export const dedupePromise = <T>() => {
  const inFlight = new Map<string, Promise<T>>();
  return (key: string, fn: () => Promise<T>): Promise<T> => {
    let promise = inFlight.get(key);
    if (!promise) {
      promise = fn().finally(() => inFlight.delete(key));
      inFlight.set(key, promise);
    }
    return promise;
  };
};
