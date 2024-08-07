import { Trans, t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import { useQueryState } from "src/lib/use-query-state";

import { Combobox, ComboboxMulti } from "../../components/combobox";
import { categories, Entity, periods, products } from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import {
  CantonsCombobox,
  MunicipalitiesCombobox,
  OperatorsCombobox,
} from "../query-combobox";

export const SelectorMulti = ({
  entity = "municipality",
}: {
  entity?: Entity;
}) => {
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
      component="fieldset"
      sx={{
        border: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        bgcolor: "muted.colored",
        px: 4,
        py: 4,
        zIndex: 13,
        "> div": { mt: 4 },
        "> fieldset": { mt: 4, border: 0 },
      }}
      display="flex"
    >
      <Typography
        component="legend"
        variant="lead"
        sx={{ display: "contents" }}
      >
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Typography>
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
