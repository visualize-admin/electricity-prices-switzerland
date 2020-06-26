import { markdown, ReactSpecimen } from "catalog";
import { ComboboxMulti, Combobox } from "../components/combobox";

export default () => markdown`
>

## Combobox (single select)

  ${(
    <ReactSpecimen>
      <Combobox
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
      />
    </ReactSpecimen>
  )}

## Combobox (multi select)

  ${(
    <ReactSpecimen>
      <ComboboxMulti
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
      />
    </ReactSpecimen>
  )}

`;
