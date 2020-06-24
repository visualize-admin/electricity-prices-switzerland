import { markdown, ReactSpecimen } from "catalog";
import { ComboboxMulti } from "../components/combobox-multi";

export default () => markdown`
> There are four basic styles that are defined as Rebass \`variant\`s:

  ${(
    <ReactSpecimen>
      <ComboboxMulti items={["apple", "banana", "cherry", "date", ""]} />
    </ReactSpecimen>
  )}

`;
