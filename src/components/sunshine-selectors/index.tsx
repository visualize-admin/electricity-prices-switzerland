import { useMemo } from "react";

import {
  years,
  viewByOptions,
  typologyOptions,
  indicatorOptions,
} from "src/domain/sunshine-data";
import { getLocalizedLabel } from "src/domain/translation";
import { useQueryStateSingle } from "src/lib/use-query-state";

import { SunshineSelectorsBase } from "./base";

export const SunshineSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSingle();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });

  const defaultValues = useMemo(
    () => ({
      tab: "sunshine",
      year: queryState.period ?? "2024",
      viewBy: queryState.viewBy ?? "all_grid_operators",
      typology: queryState.typology ?? "total",
      indicator: queryState.indicator ?? "saidi",
    }),
    [queryState]
  );

  return (
    <SunshineSelectorsBase
      year={defaultValues.year}
      setYear={(period) => setQueryState({ period })}
      years={years}
      viewBy={defaultValues.viewBy}
      setViewBy={(viewBy) => setQueryState({ viewBy })}
      viewByOptions={viewByOptions}
      typology={defaultValues.typology}
      setTypology={(typology) => setQueryState({ typology })}
      typologyOptions={typologyOptions}
      indicator={defaultValues.indicator}
      setIndicator={(indicator) => setQueryState({ indicator })}
      indicatorOptions={indicatorOptions}
      getItemLabel={getItemLabel}
    />
  );
};
