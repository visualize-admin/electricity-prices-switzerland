import { Trans } from "@lingui/macro";
import { Flex, Text } from "theme-ui";
import { ComboboxMulti } from "../../components/combobox";
import { categories, periods, products } from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";

export const SelectorMulti = () => {
  const [queryState, setQueryState] = useQueryState();

  return (
    <Flex
      as="fieldset"
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        bg: "primaryLight",
        m: 4,
        px: 5,
        py: 6,
        zIndex: 13,
        borderRadius: "default",
        "> div": { mt: 4 },
        "> fieldset": { mt: 4 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Text>

      <>
        <ComboboxMulti
          id="municipality"
          label={<Trans id="selector.municipality">Gemeinde</Trans>}
          items={periods} // FIXME: municipalities
          selectedItems={queryState.municipality ?? ["261"]}
          minSelectedItems={0}
          setSelectedItems={(items) => setQueryState({ municipality: items })}
        />
        <ComboboxMulti
          id="periods"
          label={<Trans id="selector.year">Jahr</Trans>}
          items={periods}
          selectedItems={queryState.period}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ period: items })}
        />
        <ComboboxMulti
          id="categories"
          label={<Trans id="selector.category">Kategorie</Trans>}
          items={categories}
          selectedItems={queryState.category}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ category: items })}
        />
        <ComboboxMulti
          id="products"
          label={<Trans id="selector.product">Produkt</Trans>}
          items={products}
          selectedItems={queryState.product}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ product: items })}
        />
      </>
    </Flex>
  );
};
