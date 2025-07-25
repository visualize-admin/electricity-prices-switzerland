import { useQueryStateSunshineMap } from "src/domain/query-states";
import {
  indicatorOptions,
  netElectricityCategoryOptions,
  networkLevelOptions,
  typologyOptions,
  peerGroupOptions,
  years,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";

import { SunshineSelectorsBase } from "./base";

export const SunshineSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSunshineMap();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });

  // Custom label function for peerGroup options
  const getPeerGroupLabel = (value: string) => {
    if (value === "all_grid_operators") {
      return getLocalizedLabel({ id: "peerGroup.all_grid_operators" });
    }
    // For peer group codes A-H, map to peerGroup.{code}
    return getLocalizedLabel({ id: `peerGroup.${value}` });
  };

  return (
    <SunshineSelectorsBase
      year={queryState.period}
      setYear={(period) => setQueryState({ period })}
      years={years}
      peerGroup={queryState.peerGroup}
      setPeerGroup={(peerGroup) => setQueryState({ peerGroup })}
      peerGroupOptions={peerGroupOptions}
      getPeerGroupLabel={getPeerGroupLabel}
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
      category={queryState.category}
      categoryOptions={netElectricityCategoryOptions}
      setCategory={(category) => setQueryState({ category })}
    />
  );
};
