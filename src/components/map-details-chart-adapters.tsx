import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { ReactNode, useMemo } from "react";

import { LoadingSkeleton } from "src/components/hint";
import { NetworkCostTrendChart } from "src/components/network-cost-trend-chart";
import { PowerStabilityChart } from "src/components/power-stability-chart";
import { TariffsTrendChart } from "src/components/tariffs-trend-chart";
import { useQueryStateSunshineMap } from "src/domain/query-states";
import { SunshineIndicator } from "src/domain/sunshine";
import {
  useEnergyTariffsQuery,
  useNetTariffsQuery,
  useNetworkCostsQuery,
  useSaidiQuery,
  useSaifiQuery,
} from "src/graphql/queries";

import { ListItemType } from "./list";

const ChartAdapterWrapper = ({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) => {
  return (
    <div>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {title}
      </Typography>
      {children}
    </div>
  );
};

const NetTariffsChartAdapter = ({
  period,
  selectedItem,
}: {
  period: string;
  selectedItem: ListItemType;
}) => {
  const { id, label: operatorLabel } = selectedItem;
  const [queryState] = useQueryStateSunshineMap();
  const { category } = queryState;
  const [{ data, fetching }] = useNetTariffsQuery({
    variables: {
      filter: {
        operatorId: parseInt(id, 10),
        period: parseInt(period, 10),
        category,
        operatorOnly: true,
      },
    },
  });

  const yearlyData = useMemo(() => {
    return data?.netTariffs.yearlyData;
  }, [data?.netTariffs.yearlyData]);

  if (fetching) {
    return <LoadingSkeleton height={194} />;
  }

  return (
    <ChartAdapterWrapper
      title={
        <Trans id="sunshine.costs-and-tariffs.net-tariffs-trend">
          Net Tariffs Trend
        </Trans>
      }
    >
      <TariffsTrendChart
        id={id}
        observations={yearlyData ?? []}
        netTariffs={{
          category,
          peerGroupMedianRate: data?.netTariffs?.peerGroupMedianRate,
        }}
        operatorLabel={operatorLabel ?? ""}
        viewBy="progress"
        compareWith={[]}
        mini
      />
    </ChartAdapterWrapper>
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
  const { category } = queryState;
  const [{ data, fetching }] = useEnergyTariffsQuery({
    variables: {
      filter: {
        operatorId: parseInt(id, 10),
        period: parseInt(period, 10),
        category: category,
        operatorOnly: true,
      },
    },
  });

  const yearlyData = useMemo(() => {
    return data?.energyTariffs.yearlyData;
  }, [data?.energyTariffs.yearlyData]);

  if (fetching) {
    return <LoadingSkeleton height={184} />;
  }

  return (
    <ChartAdapterWrapper
      title={
        <Trans id="sunshine.costs-and-tariffs.energy-tariffs-trend">
          Energy Tariffs Trend
        </Trans>
      }
    >
      <TariffsTrendChart
        id={id}
        observations={yearlyData ?? []}
        netTariffs={{
          category: category,
          peerGroupMedianRate: data?.energyTariffs?.peerGroupMedianRate,
        }}
        operatorLabel={operatorLabel ?? ""}
        viewBy="progress"
        compareWith={[]}
        mini
      />
    </ChartAdapterWrapper>
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
        operatorOnly: true,
      },
    },
  });

  const yearlyData = useMemo(() => {
    return data?.networkCosts.yearlyData;
  }, [data?.networkCosts.yearlyData]);

  if (fetching) {
    return <LoadingSkeleton height={194} />;
  }

  return (
    <ChartAdapterWrapper
      title={
        <Trans id="sunshine.costs-and-tariffs.network-cost-trend">
          Network Costs Trend
        </Trans>
      }
    >
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
        viewBy="progress"
        compareWith={[]}
        mini
      />
    </ChartAdapterWrapper>
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
    return <LoadingSkeleton height={170} />;
  }

  return (
    <ChartAdapterWrapper
      title={
        indicator === "saidi" ? (
          <Trans id="sunshine.power-stability.saidi-trend">SAIDI Trend</Trans>
        ) : indicator === "saifi" ? (
          <Trans id="sunshine.power-stability.saifi-trend">SAIFI Trend</Trans>
        ) : null
      }
    >
      <PowerStabilityChart
        observations={yearlyData}
        id={id}
        operatorLabel={operatorLabel ?? ""}
        viewBy="progress"
        overallOrRatio="overall"
        duration={typology}
        compareWith={[]}
        mini
      />
    </ChartAdapterWrapper>
  );
};

export const indicatorToChart: Partial<
  Record<
    SunshineIndicator,
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
