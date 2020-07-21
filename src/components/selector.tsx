import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Flex, Text } from "theme-ui";
import { categories, priceComponents, products, periods } from "../domain/data";
import { Combobox } from "./../components/combobox";
import { useQueryStateSingle } from "../lib/use-query-state";

export const Selector = () => {
  const [queryState, setQueryState] = useQueryStateSingle();

  return (
    <Flex
      as="fieldset"
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        bg: "primaryLight",
        px: 2,
        py: 4,
        zIndex: 13,
        "> div": { mt: 3 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Text>

      <>
        <Combobox
          id="year"
          label={<Trans id="selector.year">Jahr</Trans>}
          items={periods}
          selectedItem={queryState.period ?? "2020"}
          handleSelectedItemChange={({ selectedItem }) =>
            setQueryState({ period: selectedItem })
          }
        />
        <Combobox
          id="priceComponent"
          label={<Trans id="selector.priceComponent">Preiskomponent</Trans>}
          items={priceComponents}
          selectedItem={queryState.priceComponent ?? "total"}
          handleSelectedItemChange={({ selectedItem }) =>
            setQueryState({ priceComponent: selectedItem })
          }
        />

        <Combobox
          id="category"
          label={<Trans id="selector.category">Kategorie</Trans>}
          items={categories}
          selectedItem={queryState.category ?? "H4"}
          handleSelectedItemChange={({ selectedItem }) =>
            setQueryState({ category: selectedItem })
          }
        />

        <Combobox
          id="product"
          label={<Trans id="selector.product">Produkt</Trans>}
          items={products}
          selectedItem={queryState.product ?? "standard"}
          handleSelectedItemChange={({ selectedItem }) =>
            setQueryState({ product: selectedItem })
          }
        />
      </>
    </Flex>
  );
};
