import { Trans } from "@lingui/macro";
import { Tab, Tabs } from "@mui/material";
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
        data-testid="network-costs-tab"
        value={CostAndTariffsTabOption.NETWORK_COSTS}
        label={
          <Trans id="sunshine.costs-and-tariffs.network-costs">
            Network Costs
          </Trans>
        }
      />
      <Tab
        data-testid="net-tariffs-tab"
        value={CostAndTariffsTabOption.NET_TARIFFS}
        label={
          <Trans id="sunshine.costs-and-tariffs.net-tariffs">Net Tariffs</Trans>
        }
      />
      <Tab
        data-testid="energy-tariffs-tab"
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
        data-testid="saidi-tab"
        value={PowerStabilityTabOption.SAIDI}
        label={
          <Trans id="sunshine.power-stability.saidi">
            Power Outage Duration (SAIDI)
          </Trans>
        }
      />
      <Tab
        data-testid="saifi-tab"
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
        data-testid="product-variety-tab"
        value={OperationalStandardsTabOption.PRODUCT_VARIETY}
        label={
          <Trans id="sunshine.operational-standards.product-variety">
            Product Variety
          </Trans>
        }
      />
      <Tab
        data-testid="service-quality-tab"
        value={OperationalStandardsTabOption.SERVICE_QUALITY}
        label={
          <Trans id="sunshine.operational-standards.service-quality">
            Service Quality
          </Trans>
        }
      />
      <Tab
        data-testid="compliance-tab"
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
