import { rollup } from "d3";
import { useMemo, useState } from "react";

import { ComboboxMultiProps, MultiCombobox } from "src/components/combobox";
import { getLocalizedLabel } from "src/domain/translation";
import {
  useCantonsQuery,
  useMunicipalitiesQuery,
  useOperatorsQuery,
} from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

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

  const items = useMemo(
    () => gqlQuery.data?.municipalities ?? [],
    [gqlQuery.data?.municipalities]
  );

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <MultiCombobox
      {...comboboxMultiProps}
      id="municipalities"
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      lazy
      max={8}
      onInputValueChange={setInputValue}
      isLoading={gqlQuery.fetching && inputValue.length > 0}
    />
  );
};

export const OperatorsCombobox = (
  comboboxMultiProps: Pick<
    ComboboxMultiProps,
    "label" | "selectedItems" | "setSelectedItems"
  >
) => {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState<string>("");
  const [gqlQuery] = useOperatorsQuery({
    variables: {
      locale,
      query: inputValue,
      ids: comboboxMultiProps.selectedItems,
    },
    pause: inputValue === "" && comboboxMultiProps.selectedItems.length === 0,
  });

  const items = useMemo(
    () => gqlQuery.data?.operators ?? [],
    [gqlQuery.data?.operators]
  );

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <MultiCombobox
      {...comboboxMultiProps}
      id="operators"
      max={8}
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      lazy
      onInputValueChange={setInputValue}
      isLoading={gqlQuery.fetching && inputValue.length > 0}
    />
  );
};

export const CantonsCombobox = (
  comboboxMultiProps: Pick<
    ComboboxMultiProps,
    "label" | "selectedItems" | "setSelectedItems"
  >
) => {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState<string>("");
  const [gqlQuery] = useCantonsQuery({
    variables: {
      locale,
      query: inputValue,
      ids: comboboxMultiProps.selectedItems,
    },
    pause: inputValue === "" && comboboxMultiProps.selectedItems.length === 0,
  });

  const items = useMemo(
    () => gqlQuery.data?.cantons ?? [],
    [gqlQuery.data?.cantons]
  );

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <MultiCombobox
      {...comboboxMultiProps}
      id="operators"
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      lazy
      max={8}
      onInputValueChange={setInputValue}
      isLoading={gqlQuery.fetching && inputValue.length > 0}
    />
  );
};

export const AllOrMultiCombobox = (
  comboboxMultiProps: Pick<
    ComboboxMultiProps,
    "label" | "selectedItems" | "setSelectedItems" | "colorMapping" | "max"
  > & { items: { id: string; name?: string }[] }
) => {
  const { items } = comboboxMultiProps;
  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <MultiCombobox
      {...comboboxMultiProps}
      items={items.map(({ id }) => id)}
      id="compare-with-selection"
      getItemLabel={(id) => {
        return (
          itemById.get(id)?.name ??
          getLocalizedLabel({
            id,
          }) ??
          `[${id}]`
        );
      }}
    />
  );
};
