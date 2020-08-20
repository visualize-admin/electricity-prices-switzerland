import { markdown, ReactSpecimen } from "catalog";
import { ComboboxMulti, Combobox } from "../components/combobox";
import { useState, useEffect } from "react";
import { useClient } from "urql";
import {
  MunicipalitiesDocument,
  MunicipalitiesQuery,
  MunicipalitiesQueryVariables,
} from "../graphql/queries";
import {
  MunicipalitiesCombobox,
  OperatorsCombobox,
} from "../components/query-combobox";

const EXAMPLE_ITEMS = new Map([
  ["item0", "AEK Energie AG"],
  ["item1", "Aare Versorgungs AG"],
  ["item2", "Azienda Elettrica Bregaglia AEB"],
  ["item3", "Werkbetriebe der Dorfgemeinde Matzingen"],
  ["item4", "Werke am Zürichsee (Küsnacht)"],
  ["item5", "Werke am Zürichsee (Erlenbach)"],
  ["item6", "Werke am Zürichsee (Zollikon)"],
  ["item7", "Romande Energie SA"],
  ["item8", "Energie Wasser Bern ewb"],
  ["item9", "Services Industriels de Genève SIG"],
  ["item10", "ewz"],
]);

export default () => {
  const [selectedItem, setSelectedItem] = useState<string>("item4");
  const [selectedItems, setSelectedItems] = useState<string[]>(["item4"]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<
    string[]
  >(["261"]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([
    "10636012345",
  ]);

  return markdown`
>

## Combobox (single select)

  ${(
    <ReactSpecimen>
      <>
        <Combobox
          id="example-single"
          label="Choose something"
          items={[...EXAMPLE_ITEMS.keys()]}
          getItemLabel={(item) => EXAMPLE_ITEMS.get(item) ?? item}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
        <p>Selected: {selectedItem}</p>
      </>
    </ReactSpecimen>
  )}

## Combobox (multi select)

  ${(
    <ReactSpecimen>
      <>
        <ComboboxMulti
          id="example-multi"
          label="Choose some things"
          items={[...EXAMPLE_ITEMS.keys()]}
          getItemLabel={(item) => EXAMPLE_ITEMS.get(item) ?? item}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          minSelectedItems={1}
        />
        <p>Selected: {selectedItems.join(", ")}</p>
      </>
    </ReactSpecimen>
  )}

## Municipalities Combobox (multi select)

  ${(
    <ReactSpecimen>
      <>
        <MunicipalitiesCombobox
          label="Choose some municipalities"
          selectedItems={selectedMunicipalities}
          setSelectedItems={setSelectedMunicipalities}
        />
        <p>Selected: {selectedMunicipalities.join(", ")}</p>
      </>
    </ReactSpecimen>
  )}

## Operators Combobox (multi select)

  ${(
    <ReactSpecimen>
      <>
        <OperatorsCombobox
          label="Choose some operators"
          selectedItems={selectedOperators}
          setSelectedItems={setSelectedOperators}
        />
        <p>Selected: {selectedOperators.join(", ")}</p>
      </>
    </ReactSpecimen>
  )}

`;
};
