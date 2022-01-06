import { createContext, useContext, useMemo, useState } from "react";

export const makeAtom = <T extends unknown>(defaultValue: T | undefined) => {
  const Context = createContext({
    value: defaultValue,
    setValue: (newValue: T | undefined): void => undefined,
  });
  const use = () => useContext(Context);
  const Provider = ({ children }: { children: React.ReactNode }) => {
    const [value, setValue] = useState<T | undefined>(defaultValue);
    const ctxValue = useMemo(() => ({ value, setValue }), [value]);
    return <Context.Provider value={ctxValue}>{children}</Context.Provider>;
  };
  return { context: Context, use, Provider };
};
