import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useMemo } from "react";

import { Loading } from "src/components/hint";
import { NetTariffsTrendChart } from "src/components/net-tariffs-trend-chart";
import {
  QueryStateSunshineIndicator,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import { useEnergyTariffsQuery, useNetTariffsQuery } from "src/graphql/queries";

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

export const indicatorToChart: Partial<
  Record<
    QueryStateSunshineIndicator,
    React.FC<{ period: string; selectedItem: ListItemType }>
  >
> = {
  energyTariffs: EnergyTariffsChartAdapter,
  netTariffs: NetTariffsChartAdapter,
} as const;
