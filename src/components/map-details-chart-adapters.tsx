import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useMemo } from "react";

import { Loading } from "src/components/hint";
import { NetTariffsTrendChart } from "src/components/net-tariffs-trend-chart";
import { NetworkCostTrendChart } from "src/components/network-cost-trend-chart";
import { PowerStabilityChart } from "src/components/power-stability-chart";
import {
  QueryStateSunshineIndicator,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import {
  useEnergyTariffsQuery,
  useNetTariffsQuery,
  useNetworkCostsQuery,
  useSaidiQuery,
  useSaifiQuery,
} from "src/graphql/queries";

import { ListItemType } from "./list";

const NetTariffsChartAdapter = ({
  period,
  selectedItem,
}: {
  period: string;
  selectedItem: ListItemType;
}) => {
  const { id, label: operatorLabel } = selectedItem;
  const [queryState] = useQueryStateSunshineMap();
  const { netTariffCategory } = queryState;
  const [{ data, fetching }] = useNetTariffsQuery({
    variables: {
      filter: {
        operatorId: parseInt(id, 10),
        period: parseInt(period, 10),
        category: netTariffCategory,
      },
    },
  });

  // TODO Do the filtering to get only operator observations at
  // graphql level
  const yearlyData = useMemo(() => {
    const operatorId = parseInt(id, 10);
    return data?.netTariffs.yearlyData.filter(
      (p) => p.operator_id === operatorId
    );
  }, [data?.netTariffs.yearlyData, id]);

  if (fetching) {
    return <Loading />;
  }

  return (
    <div>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        <Trans id="sunshine.costs-and-tariffs.net-tariffs-trend.title">
          Net Tariffs Trend
        </Trans>
      </Typography>
      <NetTariffsTrendChart
        id={id}
        observations={yearlyData ?? []}
        netTariffs={{
          category: netTariffCategory,
          peerGroupMedianRate: data?.netTariffs?.peerGroupMedianRate,
        }}
        operatorLabel={operatorLabel ?? ""}
        view="progress"
        compareWith={[]}
        mini
      />
    </div>
  );
};

const EnergyTariffsChartAdapter = ({
  period,
  selectedItem,
}: {
  period: string;
  selectedItem: ListItemType;
}) => {
  const { id, label: operatorLabel } = selectedItem;
  const [queryState] = useQueryStateSunshineMap();
  const { energyTariffCategory } = queryState;
  const [{ data, fetching }] = useEnergyTariffsQuery({
    variables: {
      filter: {
        operatorId: parseInt(id, 10),
        period: parseInt(period, 10),
        category: energyTariffCategory,
      },
    },
  });

  // TODO Do the filtering to get only operator observations at
  // graphql level
  const yearlyData = useMemo(() => {
    const operatorId = parseInt(id, 10);
    return data?.energyTariffs.yearlyData.filter(
      (p) => p.operator_id === operatorId
    );
  }, [data?.energyTariffs.yearlyData, id]);

  if (fetching) {
    return <Loading />;
  }

  return (
    <div>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        <Trans id="sunshine.costs-and-tariffs.energy-tariffs-trend.title">
          Energy Tariffs Trend
        </Trans>
      </Typography>
      <NetTariffsTrendChart
        id={id}
        observations={yearlyData ?? []}
        netTariffs={{
          category: energyTariffCategory,
          peerGroupMedianRate: data?.energyTariffs?.peerGroupMedianRate,
        }}
        operatorLabel={operatorLabel ?? ""}
        view="progress"
        compareWith={[]}
        mini
      />
    </div>
  );
};

const NetworkCostsChartAdapter = ({
  period,
  selectedItem,
}: {
  period: string;
  selectedItem: ListItemType;
}) => {
  const { id, label: operatorLabel } = selectedItem;
  const [queryState] = useQueryStateSunshineMap();
  const { networkLevel } = queryState;
  const [{ data, fetching }] = useNetworkCostsQuery({
    variables: {
      filter: {
        operatorId: parseInt(id, 10),
        period: parseInt(period, 10),
        networkLevel: networkLevel,
      },
    },
  });

  // TODO Do the filtering to get only operator observations at
  // graphql level
  const yearlyData = useMemo(() => {
    const operatorId = parseInt(id, 10);
    return data?.networkCosts.yearlyData.filter(
      (p) => p.operator_id === operatorId
    );
  }, [data?.networkCosts.yearlyData, id]);

  if (fetching) {
    return <Loading />;
  }

  return (
    <div>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        <Trans id="sunshine.costs-and-tariffs.energy-tariffs-trend.title">
          Network Costs Trend
        </Trans>
      </Typography>
      <NetworkCostTrendChart
        id={id}
        observations={yearlyData ?? []}
        networkCosts={{
          networkLevel: {
            id: networkLevel,
          },
          peerGroupMedianRate: data?.networkCosts?.peerGroupMedianRate,
        }}
        operatorLabel={operatorLabel ?? ""}
        view="progress"
        compareWith={[]}
        mini
      />
    </div>
  );
};

const SaidiSaifiChartAdapter = ({
  period,
  selectedItem,
}: {
  period: string;
  selectedItem: ListItemType;
}) => {
  const { id, label: operatorLabel } = selectedItem;
  const [queryState] = useQueryStateSunshineMap();
  const { indicator, typology } = queryState;
  const [{ data, fetching }] = (
    indicator === "saidi" ? useSaidiQuery : useSaifiQuery
  )({
    variables: {
      filter: {
        operatorId: parseInt(id, 10),
        // TODO Change in graphql to use period
        year: parseInt(period, 10),
      },
    },
  });

  // TODO Do the filtering to get only operator observations at
  // graphql level
  const yearlyData = useMemo(() => {
    const operatorId = parseInt(id, 10);
    if (!data) {
      return [];
    }
    const yearlyData =
      indicator === "saidi" && "saidi" in data
        ? data.saidi.yearlyData
        : "saifi" in data
        ? data.saifi.yearlyData
        : [];
    return yearlyData.filter(
      // TODO Change in graphql to use operatorId
      (p) => p.operator === operatorId
    );
  }, [data, id, indicator]);

  if (fetching) {
    return <Loading />;
  }

  return (
    <div>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {indicator === "saidi" ? (
          <Trans id="sunshine.costs-and-tariffs.saidi-trend.title">
            SAIDI Trend
          </Trans>
        ) : indicator === "saifi" ? (
          <Trans id="sunshine.costs-and-tariffs.saifi-trend.title">
            SAIFI Trend
          </Trans>
        ) : null}
      </Typography>

      <PowerStabilityChart
        observations={yearlyData}
        id={id}
        operatorLabel={operatorLabel ?? ""}
        view="progress"
        overallOrRatio="overall"
        duration={typology}
        mini
      />
    </div>
  );
};
export const indicatorToChart: Partial<
  Record<
    QueryStateSunshineIndicator,
    React.FC<{ period: string; selectedItem: ListItemType }>
  >
> = {
  energyTariffs: EnergyTariffsChartAdapter,
  netTariffs: NetTariffsChartAdapter,
  networkCosts: NetworkCostsChartAdapter,

  // Using keys to make sure the component is not reused when the indicator changes
  // This is important since the useQuery hook is conditionally executed
  saidi: (props) => <SaidiSaifiChartAdapter {...props} key="saidi" />,
  saifi: (props) => <SaidiSaifiChartAdapter {...props} key="saidi" />,
} as const;
