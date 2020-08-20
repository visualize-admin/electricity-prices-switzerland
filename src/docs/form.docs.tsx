import { markdown, ReactSpecimen } from "catalog";
import {
  Radio,
  Checkbox,
  Select,
  Input,
  MiniSelect,
  SearchField,
} from "../components/form";

export default () => markdown`
> Form elements are used to select the municipalities, electricity operators or cantons to compare.

## Radio button

${(
  <ReactSpecimen span={2}>
    <Radio
      label={"Standard"}
      name={"Standard"}
      value={"Standard"}
      checked={false}
      onChange={() => {}}
    />
  </ReactSpecimen>
)}
  ${(
    <ReactSpecimen span={2}>
      <Radio
        label={"Günstig"}
        name={"Günstig"}
        value={"Günstig"}
        checked={true}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ## Checkbox

  ${(
    <ReactSpecimen span={2}>
      <Checkbox
        label={"Bern"}
        name={"Bern"}
        value={"Bern"}
        checked={false}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ${(
    <ReactSpecimen span={2}>
      <Checkbox
        label={"Zürich"}
        name={"Zürich"}
        value={"Zürich"}
        checked={true}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ## Select

  ${(
    <ReactSpecimen span={2}>
      <Select
        id="dim"
        label="Select a category"
        options={[
          { label: "H1", value: "H1" },
          { label: "H2", value: "H2" },
          { label: "H3", value: "H3" },
          { label: "H4", value: "H4" },
          { label: "H5", value: "H5" },
          { label: "H6", value: "H6" },
          { label: "H7", value: "H7" },
          { label: "H8", value: "H8" },
          { label: "C1", value: "C1" },
          { label: "C2", value: "C2" },
          { label: "C3", value: "C3" },
          { label: "C4", value: "C4" },
          { label: "C5", value: "C5" },
          { label: "C6", value: "C6" },
          { label: "C7", value: "C7" },
        ]}
      />
    </ReactSpecimen>
  )}

  ## MiniSelect

  ${(
    <ReactSpecimen span={2}>
      <MiniSelect
        id="dim"
        label="Select a category"
        options={[
          { label: "H1", value: "H1" },
          { label: "H2", value: "H2" },
          { label: "H3", value: "H3" },
          { label: "H4", value: "H4" },
          { label: "H5", value: "H5" },
          { label: "H6", value: "H6" },
          { label: "H7", value: "H7" },
          { label: "H8", value: "H8" },
          { label: "C1", value: "C1" },
          { label: "C2", value: "C2" },
          { label: "C3", value: "C3" },
          { label: "C4", value: "C4" },
          { label: "C5", value: "C5" },
          { label: "C6", value: "C6" },
          { label: "C7", value: "C7" },
        ]}
      />
    </ReactSpecimen>
  )}

  ## Input

  ${(
    <ReactSpecimen span={2}>
      <Input label="Title einfügen" />
    </ReactSpecimen>
  )}

  ## Search Field

    ${(
      <ReactSpecimen span={2}>
        <SearchField id="search-ex-1" label="Title einfügen" />
      </ReactSpecimen>
    )}

    ${(
      <ReactSpecimen span={2}>
        <SearchField
          id="search-ex-2"
          label="Netzbetreiber"
          value="Affe"
          onReset={() => alert("reset search")}
        />
      </ReactSpecimen>
    )}


  # How to use

~~~
import { Radio, Checkbox, Select, Input } from "../components/form";

<Radio
  label={"Standard"}
  name={"Standard"}
  value={"Standard"}
/>
~~~

`;
