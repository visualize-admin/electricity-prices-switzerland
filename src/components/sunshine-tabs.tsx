import { Trans } from "@lingui/macro";
import { Tabs, Tab } from "@mui/material";
import React from "react";

export enum CostAndTariffsTabOption {
  NETWORK_COSTS = 0,
  NET_TARIFFS = 1,
  ENERGY_TARIFFS = 2,
}

export const CostsAndTariffsNavigation: React.FC<{
  activeTab: unknown;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab
        value={CostAndTariffsTabOption.NETWORK_COSTS}
        label={
          <Trans id="sunshine.costs-and-tariffs.network-costs">
            Network Costs
          </Trans>
        }
      />
      <Tab
        value={CostAndTariffsTabOption.NET_TARIFFS}
        label={
          <Trans id="sunshine.costs-and-tariffs.net-tariffs">Net Tariffs</Trans>
        }
      />
      <Tab
        value={CostAndTariffsTabOption.ENERGY_TARIFFS}
        label={
          <Trans id="sunshine.costs-and-tariffs.energy-tariffs">
            Energy Tariffs
          </Trans>
        }
      />
    </Tabs>
  );
};

