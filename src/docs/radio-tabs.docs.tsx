import { RadioTabs } from "../components/radio-tabs";
import { markdown, ReactSpecimen } from "catalog";
import { useState } from "react";

export default () => {
  const [state, setState] = useState("one");

  return markdown`
## RadioTabs

  ${(
    <ReactSpecimen>
      <RadioTabs
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
    </ReactSpecimen>
  )}

  ${(<div>Selected value: {state}</div>)}

### RadioTabs (segmented variant)

  ${(
    <ReactSpecimen>
      <RadioTabs
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
    </ReactSpecimen>
  )}

  ${(<div>Selected value: {state}</div>)}

`;
};
