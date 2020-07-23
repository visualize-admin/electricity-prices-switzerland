import { rollup } from "d3-array";
import { useMemo, useState } from "react";
import { useMunicipalitiesQuery, useProvidersQuery } from "../graphql/queries";
import { useLocale } from "../lib/use-locale";
import { ComboboxMulti, ComboboxMultiProps } from "./combobox";

export const MunicipalitiesCombobox = (
  comboboxMultiProps: Pick<
    ComboboxMultiProps,
    "label" | "selectedItems" | "setSelectedItems"
  >
) => {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState<string>("");
  const [gqlQuery] = useMunicipalitiesQuery({
    variables: {
      locale,
      query: inputValue,
      ids: comboboxMultiProps.selectedItems,
    },
    pause: inputValue === "" && comboboxMultiProps.selectedItems.length === 0,
  });

  const items = gqlQuery.data?.cubeByIri?.municipalities ?? [];

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <ComboboxMulti
      {...comboboxMultiProps}
      id="municipalities"
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      lazy
      onInputValueChange={setInputValue}
      isLoading={gqlQuery.fetching && inputValue.length > 0}
    />
  );
};

export const ProvidersCombobox = (
  comboboxMultiProps: Pick<
    ComboboxMultiProps,
    "label" | "selectedItems" | "setSelectedItems"
  >
) => {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState<string>("");
  const [gqlQuery] = useProvidersQuery({
    variables: {
      locale,
      query: inputValue,
      ids: comboboxMultiProps.selectedItems,
    },
    pause: inputValue === "" && comboboxMultiProps.selectedItems.length === 0,
  });

  const items = gqlQuery.data?.cubeByIri?.providers ?? [];

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <ComboboxMulti
      {...comboboxMultiProps}
      id="municipalities"
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      lazy
      onInputValueChange={setInputValue}
      isLoading={gqlQuery.fetching && inputValue.length > 0}
    />
  );
};
