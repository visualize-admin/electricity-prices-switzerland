import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import { Combobox, ComboboxItem, MultiCombobox } from "src/components/combobox";
import {
  CantonsCombobox,
  MunicipalitiesCombobox,
  OperatorsCombobox,
} from "src/components/query-combobox";
import {
  categories,
  ElectricityCategory,
  Entity,
  periods,
  products,
} from "src/domain/data";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";

export const SelectorMulti = ({ entity }: { entity: Entity }) => {
  const [queryState, setQueryState] = useQueryStateEnergyPricesDetails();
  const getItemLabel = (id: TranslationKey) => getLocalizedLabel({ id });
  const hGroup = getItemLabel("H-group");
  const cGroup = getItemLabel("C-group");
  const groupedCategories = useMemo((): ComboboxItem<ElectricityCategory>[] => {
    return categories.map((value) => ({
      value,
      group: value.startsWith("H") ? hGroup : cGroup,
    }));
  }, [cGroup, hGroup]);

  return (
    <Box
      border={0}
      display="grid"
      gap={4}
      bgcolor="muted.colored"
      alignItems="start"
      zIndex={13}
      mt={1}
      data-testid="detail-page-selector-multi"
      gridTemplateColumns={{
        xxs: "1fr",
        sm: "repeat(2, 1fr)",
        md: "1fr",
        lg: "repeat(2, 1fr)",
        xl: "repeat(4, 1fr)",
      }}
      sx={{
        "& > *": {
          minWidth: 0,
        },
      }}
    >
      {entity === "operator" ? (
        <OperatorsCombobox
          label={
            <Trans id="selector.compareoperators">
              Network operator for comparison
            </Trans>
          }
          selectedItems={queryState.operator ?? []}
          setSelectedItems={(items) => setQueryState({ operator: items })}
        />
      ) : entity === "municipality" ? (
        <MunicipalitiesCombobox
          label={
            <Trans id="selector.comparemunicipalities">
              Municipalities for comparison
            </Trans>
          }
          selectedItems={queryState.municipality ?? []}
          setSelectedItems={(items) => setQueryState({ municipality: items })}
        />
      ) : (
        <CantonsCombobox
          label={
            <Trans id="selector.comparecantons">Cantons for comparison</Trans>
          }
          selectedItems={queryState.canton ?? []}
          setSelectedItems={(items) => setQueryState({ canton: items })}
        />
      )}
      <MultiCombobox
        id="periods"
        label={<Trans id="selector.years">Years</Trans>}
        items={periods}
        selectedItems={queryState.period}
        minSelectedItems={1}
        setSelectedItems={(items) => {
          // We must use shallow: false to make sure the municipality operators
          // are refreshed (done via getServerSideProps)
          setQueryState({ period: items }, { shallow: false });
        }}
      />
      <Combobox
        id="categories"
        label={t({ id: "selector.category", message: "Category" })}
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
        label={t({ id: "selector.product", message: "Product" })}
        items={products}
        getItemLabel={getItemLabel}
        selectedItem={queryState.product[0]}
        setSelectedItem={(selectedItem) =>
          setQueryState({ product: [selectedItem] })
        }
        infoDialogSlug="help-products"
      />
    </Box>
  );
};
