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
> Form elements are used throughout the _Visualization Tool_ whenever user input is needed.

## Radio button


${(
  <ReactSpecimen span={2}>
    <Radio
      label={"Scatterplot"}
      name={"Scatterplot"}
      value={"Scatterplot"}
      checked={false}
      onChange={() => {}}
    />
  </ReactSpecimen>
)}
  ${(
    <ReactSpecimen span={2}>
      <Radio
        label={"Scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        checked={true}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ## Checkbox

  ${(
    <ReactSpecimen span={2}>
      <Checkbox
        label={"Zürich"}
        name={"Zürich"}
        value={"Zürich"}
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
        label="Dimension wählen"
        options={[
          { label: "Nadelholz", value: "Nadelholz" },
          { label: "Laubholz", value: "Laubholz" },
        ]}
      />
    </ReactSpecimen>
  )}

  ## MiniSelect

  ${(
    <ReactSpecimen span={2}>
      <MiniSelect
        id="dim"
        label="Dimension wählen"
        options={[
          { label: "Nadelholz", value: "Nadelholz" },
          { label: "Laubholz", value: "Laubholz" },
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
          label="Tier"
          value="Affe"
          onReset={() => alert("reset search")}
        />
      </ReactSpecimen>
    )}


  # How to use

~~~
import { Radio, Checkbox, Select, Input } from "../components/form";

<Radio
  label={"Scatterplot"}
  name={"Scatterplot"}
  value={"Scatterplot"}
/>
~~~

`;
