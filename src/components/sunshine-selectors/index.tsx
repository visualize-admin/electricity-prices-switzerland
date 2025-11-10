import { keyBy } from "lodash";

import { LoadingSkeleton } from "src/components/hint";
import { useQueryStateSunshineMap } from "src/domain/query-states";
import {
  complianceTypes,
  indicatorOptions,
  netElectricityCategoryOptions,
  networkLevelOptions,
  saidiSaifiTypes,
  years,
} from "src/domain/sunshine";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";
import { usePeerGroupsQuery } from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

import { SunshineSelectorsBase } from "./base";

export const SunshineSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSunshineMap();
  const locale = useLocale();
  const getItemLabel = (id: TranslationKey) => getLocalizedLabel({ id });

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
        ...(peerGroupsResult.data?.peerGroups.map((x) => x.id) ?? []).sort(
          (a, b) => {
            return parseFloat(a) - parseFloat(b);
          }
        ),
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
      saidiSaifiType={queryState.saidiSaifiType}
      setSaidiSaifiType={(saidiSaifiType) => setQueryState({ saidiSaifiType })}
      saidiSaifiTypes={saidiSaifiTypes}
      complianceType={queryState.complianceType}
      setComplianceType={(complianceType) => setQueryState({ complianceType })}
      complianceTypes={complianceTypes}
      indicator={queryState.indicator}
      setIndicator={(indicator) => setQueryState({ indicator })}
      indicatorOptions={indicatorOptions}
      getItemLabel={getItemLabel}
      networkLevel={queryState.networkLevel}
      setNetworkLevel={(networkLevel) =>
        setQueryState({
          networkLevel: networkLevel as "NE5" | "NE6" | "NE7" | undefined,
        })
      }
      networkLevelOptions={networkLevelOptions}
      category={queryState.category}
      categoryOptions={netElectricityCategoryOptions}
      setCategory={(category) => setQueryState({ category })}
    />
  );
};
