import FlagStore from "./store";
import { FlagName, FlagValue } from "./types";

const FLAG_URL_PREFIX = "flag__";

const createAPI = (namespace: string) => {
  const store = new FlagStore(namespace);

  /**
   * Public API to use flags
   */
  const flag = function flag(...args: [FlagName] | [FlagName, FlagValue]) {
    if (args.length === 1) {
      return store.get(args[0]);
    } else {
      const [name, value] = args;
      store.set(name, value);
      return value;
    }
  };

  /** List all flags from the store */
  const listFlags = () => {
    return store.keys().sort();
  };

  /** Resets all the flags */
  const resetFlags = () => {
    listFlags().forEach((name) => store.remove(name));
  };

  /**
   * Enables several flags
   */
  const enable = (flagsToEnable: [FlagName, FlagValue][]) => {
    flagsToEnable.forEach(([flagName, flagValue]) => {
      flag(flagName as FlagName, flagValue);
    });
  };

  const initFromSearchParams = (locationSearch: string) => {
    locationSearch = locationSearch.startsWith("?")
      ? locationSearch.substr(1)
      : locationSearch;
    const params = new URLSearchParams(locationSearch);
    for (const [param, value] of Object.entries(Object.fromEntries(params))) {
      if (param.startsWith(FLAG_URL_PREFIX) && typeof value === "string") {
        try {
          const flagName = param.substring(FLAG_URL_PREFIX.length);
          const flagValue = JSON.parse(value);
          flag(flagName, flagValue);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  flag.store = store;
  flag.list = listFlags;
  flag.reset = resetFlags;
  flag.enable = enable;
  flag.initFromSearchParams = initFromSearchParams;

  return flag;
};

/** @knipignore */
export type FlagAPI = ReturnType<typeof createAPI>;

export default createAPI;
