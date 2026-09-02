import { t } from "@lingui/macro";
import { rollup } from "d3";
import { useMemo, useState } from "react";

import { ComboboxMultiProps, MultiCombobox } from "src/components/combobox";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabelUnsafe } from "src/domain/translation";
import {
  ObservationKind,
  PriceComponent,
  useCantonsQuery,
  useMunicipalitiesQuery,
  useObservationsQuery,
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
  const [{ period, category, product, priceComponent }] =
    useQueryStateEnergyPricesDetails();
  const [inputValue, setInputValue] = useState<string>("");
  const [gqlQuery] = useCantonsQuery({
    variables: {
      locale,
      query: inputValue,
      ids: comboboxMultiProps.selectedItems,
    },
    pause: inputValue === "" && comboboxMultiProps.selectedItems.length === 0,
  });
  const [{ data: observationsData, fetching: observationsFetching }] =
    useObservationsQuery({
      variables: {
        locale,
        priceComponent: priceComponent[0] as PriceComponent,
        filters: { period, category, product },
        observationKind: ObservationKind.Canton,
      },
    });

  const idsWithData = useMemo(
    () =>
      new Set(observationsData?.cantonMedianObservations?.map((o) => o.canton)),
    [observationsData?.cantonMedianObservations]
  );

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

  const noDataLabel = t({ id: "combobox.nodata", message: "No data" });

  return (
    <MultiCombobox
      {...comboboxMultiProps}
      id="cantons"
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      isItemDisabled={(id) => Boolean(observationsData) && !idsWithData.has(id)}
      getItemEndLabel={(id) =>
        observationsData && !idsWithData.has(id) ? noDataLabel : null
      }
      lazy
      max={8}
      onInputValueChange={setInputValue}
      isLoading={
        (gqlQuery.fetching && inputValue.length > 0) || observationsFetching
      }
    />
  );
};

export const ItemMultiCombobox = (
  comboboxMultiProps: Pick<
    ComboboxMultiProps,
    | "label"
    | "selectedItems"
    | "setSelectedItems"
    | "colorMapping"
    | "max"
    | "InputProps"
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
          getLocalizedLabelUnsafe({
            id,
          }) ??
          `[${id}]`
        );
      }}
    />
  );
};
