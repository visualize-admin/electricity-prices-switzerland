import { useQueryStateSunshineMap } from "src/domain/query-states";
import {
  energyTariffCategoryOptions,
  indicatorOptions,
  netTariffCategoryOptions,
  networkLevelOptions,
  typologyOptions,
  viewByOptions,
  years,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";

import { SunshineSelectorsBase } from "./base";

export const SunshineSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSunshineMap();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });

  // Custom label function for viewBy options
  const getViewByLabel = (value: string) => {
    if (value === "all_grid_operators") {
      return getLocalizedLabel({ id: "viewBy.all_grid_operators" });
    }
    // For peer group codes A-H, map to viewBy.{code}
    return getLocalizedLabel({ id: `viewBy.${value}` });
  };

  return (
    <SunshineSelectorsBase
      year={queryState.period}
      setYear={(period) => setQueryState({ period })}
      years={years}
      viewBy={queryState.viewBy}
      setViewBy={(viewBy) => setQueryState({ viewBy })}
      viewByOptions={viewByOptions}
      getViewByLabel={getViewByLabel}
      typology={queryState.typology}
      setTypology={(typology) => setQueryState({ typology })}
      typologyOptions={typologyOptions}
      indicator={queryState.indicator}
      setIndicator={(indicator) => setQueryState({ indicator })}
      indicatorOptions={indicatorOptions}
      getItemLabel={getItemLabel}
      networkLevel={queryState.networkLevel}
      setNetworkLevel={(networkLevel) => setQueryState({ networkLevel })}
      networkLevelOptions={networkLevelOptions}
      netTariffCategory={queryState.netTariffCategory}
      netTariffsCategoryOptions={netTariffCategoryOptions}
      setNetTariffCategory={(netTariffCategory) =>
        setQueryState({ netTariffCategory })
      }
      energyTariffCategory={queryState.energyTariffCategory}
      energyTariffsCategoryOptions={energyTariffCategoryOptions}
      setEnergyTariffCategory={(energyTariffCategory) =>
        setQueryState({ energyTariffCategory })
      }
    />
  );
};
