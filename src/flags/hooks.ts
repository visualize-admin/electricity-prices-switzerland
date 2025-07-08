import { useEffect, useState } from "react";

import createAPI from "./api";

const createHooks = <T extends string>(namespace: string) => {
  const flag = createAPI(namespace);

  const useFlag = (name: T) => {
    const [flagValue, setFlag] = useState(() => flag(name));
    useEffect(() => {
      const handleChange = (changed: string) => {
        if (changed === name) {
          setFlag(flag(name));
        }
      };
      flag.store.ee.on("change", handleChange);
      return () => {
        flag.store.removeListener("change", handleChange);
      };
    }, [setFlag, name]);
    return flagValue;
  };

  const useFlags = () => {
    const [flags, setFlags] = useState(flag.list());
    useEffect(() => {
      const handleChange = () => {
        setFlags(flag.list());
      };
      flag.store.ee.on("change", handleChange);
      return () => {
        flag.store.removeListener("change", handleChange);
      };
    }, [setFlags]);
    return flags;
  };

  return { useFlag, useFlags, flag };
};

export type FlagHooks<T extends string> = ReturnType<typeof createHooks<T>>;

export default createHooks;
