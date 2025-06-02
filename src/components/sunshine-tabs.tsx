import { Trans } from "@lingui/macro";
import { Tabs, Tab } from "@mui/material";
import React from "react";

export enum CostAndTariffsTabOption {
  NETWORK_COSTS = 0,
  NET_TARIFFS = 1,
  ENERGY_TARIFFS = 2,
}

export const CostsAndTariffsNavigation: React.FC<{
  activeTab: CostAndTariffsTabOption;
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

export enum PowerStabilityTabOption {
  SAIDI = 0,
  SAIFI = 1,
}

export const PowerStabilityNavigation: React.FC<{
  activeTab: PowerStabilityTabOption;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab
        value={PowerStabilityTabOption.SAIDI}
        label={
          <Trans id="sunshine.power-stability.saidi">
            Power Outage Duration (SAIDI)
          </Trans>
        }
      />
      <Tab
        value={PowerStabilityTabOption.SAIFI}
        label={
          <Trans id="sunshine.power-stability.saifi">
            Power Outage Frequency (SAIFI)
          </Trans>
        }
      />
    </Tabs>
  );
};

export enum OperationalStandardsTabOption {
  PRODUCT_VARIETY = 0,
  SERVICE_QUALITY = 1,
  COMPLIANCE = 2,
}

export const OperationalStandardsNavigation: React.FC<{
  activeTab: OperationalStandardsTabOption;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab
        value={OperationalStandardsTabOption.PRODUCT_VARIETY}
        label={
          <Trans id="sunshine.operational-standards.product-variety">
            Product Variety
          </Trans>
        }
      />
      <Tab
        value={OperationalStandardsTabOption.SERVICE_QUALITY}
        label={
          <Trans id="sunshine.operational-standards.service-quality">
            Service Quality
          </Trans>
        }
      />
      <Tab
        value={OperationalStandardsTabOption.COMPLIANCE}
        label={
          <Trans id="sunshine.operational-standards.compliance">
            Compliance
          </Trans>
        }
      />
    </Tabs>
  );
};
