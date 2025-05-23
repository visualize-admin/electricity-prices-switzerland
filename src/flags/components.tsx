import React from "react";

import { FlagHooks } from "./hooks";
import { FlagName } from "./types";

const human = (name: FlagName) => {
  return name.replace(
    /[a-z][A-Z]/g,
    (str) => `${str[0]} ${str[1].toLowerCase()}`
  );
};

const createComponents = <T extends string>(hooks: FlagHooks<T>) => {
  const { flag, useFlags } = hooks;

  type FlagInputProps = {
    name: FlagName;
    onChange: () => void;
  };

  const FlagInput = ({ name, onChange }: FlagInputProps) => {
    return (
      <input
        type="checkbox"
        checked={!!flag(name)}
        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
          flag(name, JSON.parse(ev.target.checked.toString()));
          onChange();
        }}
      />
    );
  };

  // eslint-disable-next-line import/prefer-default-export
  const FlagList = () => {
    const allFlags = useFlags();
    return (
      <div>
        {allFlags.map((name: string) => {
          return (
            <div key={name}>
              {human(name)}:{" "}
              <FlagInput onChange={() => undefined} name={name} />
            </div>
          );
        })}
      </div>
    );
  };

  return { FlagList, FlagInput };
};

export default createComponents;
