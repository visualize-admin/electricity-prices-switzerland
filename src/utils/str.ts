export const lowercase = <T extends string>(str: T): Lowercase<T> => {
  return str.toLowerCase() as Lowercase<T>;
};
