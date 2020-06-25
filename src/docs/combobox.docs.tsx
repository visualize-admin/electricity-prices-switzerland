import { markdown, ReactSpecimen } from "catalog";
import { ComboboxMulti, Combobox } from "../components/combobox";

export default () => markdown`
> 

## Combobox (single select)

  ${(
    <ReactSpecimen>
      <Combobox label="Choose something" items={["apple", "banana", "cherry", "date", "asparagus"]} />
    </ReactSpecimen>
  )}

## Combobox (multi select)

  ${(
    <ReactSpecimen>
      <ComboboxMulti label="Choose something" items={["apple", "banana", "cherry", "date", "asparagus"]} />
    </ReactSpecimen>
  )}

`;
