import { FlagName, FlagValue } from "./types";

const createLocalStorageAdapter = (namespace: string) => {
  const prefix = `flag__${namespace}__`;
  const getKey = (name: FlagName) => `${prefix}${name}`;

  const listFlagLocalStorage = () => {
    return Object.keys(localStorage)
      .filter((x) => x.indexOf(prefix) === 0)
      .map((x) => x.replace(prefix, ""));
  };

  const getItem = (flag: FlagName) => {
    try {
      const val = localStorage.getItem(getKey(flag));
      const parsed = val ? JSON.parse(val) : val;
      return parsed;
    } catch {
      return;
    }
  };

  const setItem = (flag: FlagName, value: FlagValue) => {
    const str = JSON.stringify(value);
    return localStorage.setItem(getKey(flag), str);
  };

  const removeItem = (flag: FlagName) => {
    return localStorage.removeItem(getKey(flag));
  };

  const getAll = () => {
    const res = {} as Record<string, FlagValue>;
    listFlagLocalStorage().forEach((flag) => {
      res[flag] = getItem(flag);
    });
    return res;
  };

  const clearAll = () => {
    listFlagLocalStorage().forEach((flag) => {
      removeItem(flag);
    });
  };

  return {
    getAll,
    getItem,
    setItem,
    clearAll,
    removeItem,
  };
};

export type LocalStorageAdapter = ReturnType<typeof createLocalStorageAdapter>;

export default createLocalStorageAdapter;
