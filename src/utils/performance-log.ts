export const withPerformanceLog = <
  T extends (...args: $IntentionalAny[]) => Promise<$IntentionalAny>
>(
  methodName: string,
  method: T
): T => {
  return (async (...args: $IntentionalAny[]) => {
    const start = performance.now();
    try {
      const result = await method(...args);
      const end = performance.now();
      // eslint-disable-next-line no-console
      console.log(`${methodName} completed in ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      // eslint-disable-next-line no-console
      console.log(`[${methodName}] failed after ${(end - start).toFixed(2)}ms`);
      throw error;
    }
  }) as T;
};
