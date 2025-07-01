import { Trans } from "@lingui/macro";
import { Tab, Tabs } from "@mui/material";
import React from "react";

export type CostAndTariffsTab = "networkCosts" | "netTariffs" | "energyTariffs";

export const CostsAndTariffsNavigation: React.FC<{
  activeTab: string;
  handleTabChange: (
    event: React.SyntheticEvent,
    newValue: CostAndTariffsTab
  ) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab
        data-testid="network-costs-tab"
        value={"networkCosts" satisfies CostAndTariffsTab}
        label={
          <Trans id="sunshine.costs-and-tariffs.network-costs">
            Network Costs
          </Trans>
        }
      />
      <Tab
        data-testid="net-tariffs-tab"
        value={"netTariffs" satisfies CostAndTariffsTab}
        label={
          <Trans id="sunshine.costs-and-tariffs.net-tariffs">Net Tariffs</Trans>
        }
      />
      <Tab
        data-testid="energy-tariffs-tab"
        value={"energyTariffs" satisfies CostAndTariffsTab}
        label={
          <Trans id="sunshine.costs-and-tariffs.energy-tariffs">
            Energy Tariffs
          </Trans>
        }
      />
    </Tabs>
  );
};

export type PowerStabilityTab = "saidi" | "saifi";

export const PowerStabilityNavigation: React.FC<{
  activeTab: string;
  handleTabChange: (
    event: React.SyntheticEvent,
    newValue: PowerStabilityTab
  ) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab
        data-testid="saidi-tab"
        value={"saidi" satisfies PowerStabilityTab}
        label={
          <Trans id="sunshine.power-stability.saidi">
            Power Outage Duration (SAIDI)
          </Trans>
        }
      />
      <Tab
        data-testid="saifi-tab"
        value={"saifi" satisfies PowerStabilityTab}
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
  SERVICE_QUALITY = 0,
  COMPLIANCE = 1,
}

export const OperationalStandardsNavigation: React.FC<{
  activeTab: OperationalStandardsTabOption;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
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

export type YearlyTab = `${number}`;

export type YearlyNavigationProps = {
  activeTab: string;
  handleTabChange: (event: React.SyntheticEvent, newValue: YearlyTab) => void;
};

export const YearlyNavigation: React.FC<YearlyNavigationProps> = ({
  activeTab,
  handleTabChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      {years.map((year) => (
        <Tab
          key={year}
          data-testid={`${year}-tab`}
          value={`${year}` satisfies YearlyTab}
          label={
            <Trans id="sunshine.costs-and-tariffs.year" values={{ year }}>
              {year}
            </Trans>
          }
        />
      ))}
    </Tabs>
  );
};
