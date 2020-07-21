import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Flex, Text } from "theme-ui";
import {
  categories,
  priceComponents,
  products,
  periods,
} from "../../domain/data";
import { Combobox, ComboboxMulti } from "../../components/combobox";
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
          id="periods"
          label={<Trans id="selector.year">Jahr</Trans>}
          items={periods}
          selectedItems={queryState.period ?? ["2020"]}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ period: items })}
        />
      </>
    </Flex>
  );
};
