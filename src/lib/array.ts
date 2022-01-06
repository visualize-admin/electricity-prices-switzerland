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

export const maxBy = <T extends unknown>(
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
