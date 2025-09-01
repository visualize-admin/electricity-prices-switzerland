export const sortByIndex = <T>({
  data,
  order,
  getCategory,
  sortOrder,
}: {
  data: T[];
  order: string[];
  getCategory: (datum: T) => string;
  sortOrder?: "asc" | "desc";
}) => {
  data.sort((a, b) => {
    const A = getCategory(a);
    const B = getCategory(b);
    if (order.indexOf(A) > order.indexOf(B)) {
      return sortOrder === "asc" ? 1 : -1;
    } else {
      return sortOrder === "asc" ? -1 : 1;
    }
  });

  return data;
};

export const normalize = (val: number, max: number, min: number): number =>
  (val - min) / (max - min);

export const maxBy = <T>(
  arr: T[] | undefined,
  iterator: (item: T) => string | number | undefined
): T | undefined => {
  let max = undefined;
  let maxV = undefined;
  if (!arr || !arr.length) {
    return max;
  }
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const value = iterator(item);
    if (maxV === undefined || (value && maxV < value)) {
      max = item;
      maxV = value;
    }
  }
  return max;
};

export const minMaxBy = <T>(arr: T[], by: (d: T) => number) => {
  let minV = Infinity;
  let minD = undefined as undefined | T;
  let maxV = -Infinity;
  let maxD = undefined as undefined | T;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const v = by(item);
    if (v < minV) {
      minD = item;
      minV = v;
    }
    if (v > maxV) {
      maxD = item;
      maxV = v;
    }
  }
  return [minD, maxD] as [T, T];
};

// Builds and index while mapping
export const indexMapper = <T, K, V>(
  iterable: Iterable<T>,
  keyFn: (item: T) => K,
  valueFn: (item: T) => V
) => {
  const index = new Map<K, V>();
  for (const item of iterable) {
    // early out if already exists
    const key = keyFn(item);
    if (index.has(key)) {
      continue;
    }
    index.set(key, valueFn(item));
  }
  return index;
};
