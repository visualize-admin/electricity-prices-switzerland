export const mapValues = <T extends unknown, V extends unknown>(
  obj: Record<string, T> | undefined | Map<string, T>,
  iterator: (item: T, key: string) => V
): Record<string, V> => {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  const entries = obj instanceof Map ? Array.from(obj) : Object.entries(obj);
  return Object.fromEntries(
    entries.map(([k, v]) => [k, iterator(v, k)])
  ) as Record<string, V>;
};
