import { keyBy } from "lodash";

import { LoadingSkeleton } from "src/components/hint";
import { useQueryStateSunshineMap } from "src/domain/query-states";
import {
  indicatorOptions,
  netElectricityCategoryOptions,
  networkLevelOptions,
  typologyOptions,
  years,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import { usePeerGroupsQuery } from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

import { SunshineSelectorsBase } from "./base";

export const SunshineSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSunshineMap();
  const locale = useLocale();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });

  const [peerGroupsResult] = usePeerGroupsQuery({
    variables: { locale },
    requestPolicy: "cache-first",
  });
  const peerGroupsById = keyBy(
    peerGroupsResult.data?.peerGroups ?? [],
    (x) => x.id
  );

  // Custom label function for peerGroup options
  const getPeerGroupLabel = (value: string) => {
    if (value === "all_grid_operators") {
      return getLocalizedLabel({ id: "peer-group.all-grid-operators" });
    }
    return peerGroupsById[value]?.name ?? value;
  };

  const peerGroupOptions = peerGroupsResult.data
    ? [
        "all_grid_operators",
        ...(peerGroupsResult.data?.peerGroups.map((x) => x.id) ?? []),
      ]
    : [];

  if (peerGroupsResult.fetching && !peerGroupsResult.data) {
    return <LoadingSkeleton height={200} />;
  }

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
