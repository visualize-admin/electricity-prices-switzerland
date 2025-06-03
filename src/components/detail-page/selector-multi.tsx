import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import { Combobox, ComboboxMulti } from "src/components/combobox";
import {
  CantonsCombobox,
  MunicipalitiesCombobox,
  OperatorsCombobox,
} from "src/components/query-combobox";
import { categories, Entity, periods, products } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { useQueryState } from "src/lib/use-query-state";

export const SelectorMulti = ({ entity }: { entity: Entity }) => {
  const [queryState, setQueryState] = useQueryState();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("H-group") },
      ...categories.filter((x) => x.startsWith("H")),
      { type: "header", title: getItemLabel("C-group") },
      ...categories.filter((x) => x.startsWith("C")),
    ] as React.ComponentProps<typeof Combobox>["items"];
  }, []);

  return (
    <Box
      sx={{
        border: 0,
        display: "grid",
        gap: 4,
        bgcolor: "muted.colored",
        alignItems: "start",
        zIndex: 13,
        mt: 1,
        gridTemplateColumns: {
          xxs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "1fr",
          lg: "repeat(2, 1fr)",
          xl: "repeat(4, 1fr)",
        },
        "& > *": {
          minWidth: 0,
        },
      }}
    >
      <>
        {entity === "operator" ? (
          <OperatorsCombobox
            label={
              <Trans id="selector.compareoperators">
                Netzbetreiber zum Vergleich
              </Trans>
            }
            selectedItems={queryState.operator ?? []}
            setSelectedItems={(items) => setQueryState({ operator: items })}
          />
        ) : entity === "municipality" ? (
          <MunicipalitiesCombobox
            label={
              <Trans id="selector.comparemunicipalities">
                Gemeinden zum Vergleich
              </Trans>
            }
            selectedItems={queryState.municipality ?? []}
            setSelectedItems={(items) => setQueryState({ municipality: items })}
          />
        ) : (
          <CantonsCombobox
            label={
              <Trans id="selector.comparecantons">Kantone zum Vergleich</Trans>
            }
            selectedItems={queryState.canton ?? []}
            setSelectedItems={(items) => setQueryState({ canton: items })}
          />
        )}
        <ComboboxMulti
          id="periods"
          label={<Trans id="selector.years">Jahre</Trans>}
          items={periods}
          selectedItems={queryState.period}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ period: items })}
        />
        <Combobox
          id="categories"
          label={t({ id: "selector.category", message: `Kategorie` })}
          items={groupedCategories}
          getItemLabel={getItemLabel}
          selectedItem={queryState.category[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ category: [selectedItem] })
          }
          infoDialogSlug="help-categories"
        />
        <Combobox
          id="products"
          label={t({ id: "selector.product", message: `Produkt` })}
          items={products}
          getItemLabel={getItemLabel}
          selectedItem={queryState.product[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ product: [selectedItem] })
          }
          infoDialogSlug="help-products"
        />
      </>
    </Box>
  );
};
