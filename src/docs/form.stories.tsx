import { Stack } from "@mui/material";

import {
  Radio as RadioComponent,
  Checkbox as CheckboxComponent,
  Select as SelectComponent,
  Input as InputComponent,
  MiniSelect as MiniSelectComponent,
  SearchField as SearchFieldComponent,
} from "../components/form";

// > Form elements are used to select the municipalities, electricity operators or cantons to compare.

export const RadioButton = () => (
  <>
    <RadioComponent
      label={"Standard"}
      name={"Standard"}
      value={"Standard"}
      checked={false}
      onChange={() => {}}
    />
    <RadioComponent
      label={"Günstig"}
      name={"Günstig"}
      value={"Günstig"}
      checked={true}
      onChange={() => {}}
    />
  </>
);

export const Checkbox = () => (
  <>
    <CheckboxComponent
      label={"Bern"}
      name={"Bern"}
      value={"Bern"}
      checked={false}
      onChange={() => {}}
    />

    <CheckboxComponent
      label={"Zürich"}
      name={"Zürich"}
      value={"Zürich"}
      checked={true}
      onChange={() => {}}
    />
  </>
);

export const Select = () => (
  <SelectComponent
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
);

export const MiniSelect = () => (
  <MiniSelectComponent
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
);

export const Input = () => <InputComponent label="Title einfügen" />;

export const SearchField = () => (
  <Stack direction="column" gap={1}>
    <SearchFieldComponent id="search-ex-1" label="Title einfügen" />
    <SearchFieldComponent
      id="search-ex-2"
      label="Netzbetreiber"
      value="Affe"
      onReset={() => alert("reset search")}
    />
  </Stack>
);

export default {
  title: "Components / Form",
  component: InputComponent,
};
