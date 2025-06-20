import {
  years,
  viewByOptions,
  typologyOptions,
  indicatorOptions,
  networkLevelOptions,
  netTariffCategoryOptions,
  energyTariffCategoryOptions,
} from "src/domain/sunshine-data";
import { getLocalizedLabel } from "src/domain/translation";
import { useQueryStateSunshineMap } from "src/lib/use-query-state";

import { SunshineSelectorsBase } from "./base";

export const SunshineSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSunshineMap();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });

  return (
    <SunshineSelectorsBase
      year={queryState.period}
      setYear={(period) => setQueryState({ period })}
      years={years}
      viewBy={queryState.viewBy}
      setViewBy={(viewBy) => setQueryState({ viewBy })}
      viewByOptions={viewByOptions}
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
