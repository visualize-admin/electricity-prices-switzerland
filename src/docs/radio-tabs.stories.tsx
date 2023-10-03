import { useState } from "react";

import { RadioTabs as RadioTabsComponent } from "../components/radio-tabs";

export const RadioTabs = () => {
  const [state, setState] = useState("one");

  return (
    <>
      <RadioTabsComponent
        name="example1"
        options={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
          { value: "three", label: "Three" },
          { value: "four", label: "Four" },
        ]}
        value={state}
        setValue={setState}
      />
      <div>Selected value: {state}</div>
    </>
  );
};

export const RadioTabsSegmented = () => {
  const [state, setState] = useState("one");

  return (
    <>
      <RadioTabsComponent
        name="example2"
        options={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
          { value: "three", label: "Three" },
          { value: "four", label: "Four" },
        ]}
        value={state}
        setValue={setState}
        variant="segmented"
      />
      <div>Selected value: {state}</div>
    </>
  );
};

export default {
  title: "Components / Radio tabs",
  component: RadioTabsComponent,
};
