import { markdown, ReactSpecimen } from "catalog";
import { ComboboxMulti, Combobox } from "../components/combobox";
import { useState } from "react";

export default () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([
    "AEK Energie AG",
  ]);

  return markdown`
>

## Combobox (single select)

  ${(
    <ReactSpecimen>
      <ComboboxExample />
    </ReactSpecimen>
  )}

## Combobox (multi select)

  ${(
    <ReactSpecimen>
      <ComboboxMulti
        id="ex1"
        label="Choose something"
        items={[
          "AEK Energie AG",
          "Aare Versorgungs AG",
          "Azienda Elettrica Bregaglia AEB",
          "Werkbetriebe der Dorfgemeinde Matzingen",
          "Werke am Zürichsee (Küsnacht)",
          "Werke am Zürichsee (Erlenbach)",
          "Werke am Zürichsee (Zollikon)",
          "Romande Energie SA",
          "Energie Wasser Bern ewb",
          "Services Industriels de Genève SIG",
          "ewz",
        ]}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        minSelectedItems={1}
      />
    </ReactSpecimen>
  )}

`;
};

const ComboboxExample = () => {
  const [selectedItem, update] = useState("Werke am Zürichsee (Zollikon)");
  const handleSelectedItemChange = ({ selectedItem }: any) =>
    update(selectedItem);
  return (
    <Combobox
      id="ex2"
      label="Choose something"
      items={[
        "AEK Energie AG",
        "Aare Versorgungs AG",
        "Azienda Elettrica Bregaglia AEB",
        "Werkbetriebe der Dorfgemeinde Matzingen",
        "Werke am Zürichsee (Küsnacht)",
        "Werke am Zürichsee (Erlenbach)",
        "Werke am Zürichsee (Zollikon)",
        "Romande Energie SA",
        "Energie Wasser Bern ewb",
        "Services Industriels de Genève SIG",
        "ewz",
      ]}
      selectedItem={selectedItem}
      handleSelectedItemChange={handleSelectedItemChange}
    />
  );
};
