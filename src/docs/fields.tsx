import React, { useMemo, useState } from "react";

function mapValues<T extends object>(o: T, fn: (v: T[keyof T]) => string) {
  const res = {} as Record<string, string>;
  for (let k of Object.keys(o)) {
    res[k] = fn(o[k as keyof typeof o]);
  }
  return res as Record<string, ReturnType<typeof fn>>;
}

type FieldOptions = {
  min?: number;
  max?: number;
  choices?: string[];
  value: string;
};

type FieldsOptions = Record<string, FieldOptions>;
type InputProps = {
  name: string;
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  value: string;
  options: FieldOptions;
};
export const useValues = <TFieldsOptions extends FieldsOptions>(
  options: TFieldsOptions
) => {
  const [state, setState] = useState(mapValues(options, (x) => x.value));
  const handleChange = (name: string, value: string) => {
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const fields = useMemo(() => {
    return Object.keys(state).map((k) => ({
      name: k,
      onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        handleChange(k, ev.currentTarget.value),
      value: state[k as keyof typeof state],
      options: options[k],
    })) as InputProps[];
  }, [state, options]);

  return {
    values: state,
    fields,
  };
};

const Field = ({ onChange, value, options }: InputProps) => {
  console.log("p[tions", options);
  if (
    typeof options.min !== "undefined" &&
    typeof options.max !== "undefined"
  ) {
    return (
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={options.min}
        max={options.max}
      />
    );
  } else if (typeof options.choices !== "undefined") {
    return (
      <select value={value} onChange={onChange}>
        {options.choices.map((c) => (
          <option value={c}>{c}</option>
        ))}
      </select>
    );
  } else {
    return <input type="text" value={value} onChange={onChange} />;
  }
};

export const Fields = ({ fields }: { fields: InputProps[] }) => {
  return (
    <>
      {fields.map((f) => {
        return (
          <div>
            <label>
              {f.name}: <Field {...f} />
            </label>
          </div>
        );
      })}
    </>
  );
};
