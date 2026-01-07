import { Trans } from "@lingui/macro";
import {
  NativeSelect,
  NativeSelectProps,
  Tab,
  Tabs,
  TabsProps,
} from "@mui/material";
import React, { ReactNode, useCallback } from "react";

import { useIsMobile } from "src/lib/use-mobile";

type ResponsiveNavigationItem<T extends string> = {
  value: T;
  label: ReactNode;
  testId?: string;
};

type ResponsiveNavigationProps<T extends string> = {
  activeTab: T;
  items: ResponsiveNavigationItem<T>[];
  onChange: (event: React.SyntheticEvent, newValue: T) => void;
} & Omit<TabsProps, "onChange" | "value">;

export const ResponsiveNavigation = <T extends string>({
  activeTab,
  items,
  onChange,
  ...tabsProps
}: ResponsiveNavigationProps<T>) => {
  const isMobile = useIsMobile();

  const handleSelectChange = useCallback<
    NonNullable<NativeSelectProps["onChange"]>
  >(
    (event) => {
      onChange(
        event as unknown as React.SyntheticEvent,
        event.target.value as T
      );
    },
    [onChange]
  );

  if (isMobile) {
    return (
      <NativeSelect
        value={activeTab}
        onChange={handleSelectChange}
        sx={{ minWidth: 200 }}
        size="sm"
      >
        {items.map((item) => (
          <option key={item.value} value={item.value} data-testid={item.testId}>
            {item.label}
          </option>
        ))}
      </NativeSelect>
    );
  }

  return (
    <Tabs value={activeTab} onChange={onChange} {...tabsProps}>
      {items.map((item) => (
        <Tab
          key={item.value}
          data-testid={item.testId}
          value={item.value}
          label={item.label}
        />
      ))}
    </Tabs>
  );
};

export type CostAndTariffsTab = "networkCosts" | "netTariffs" | "energyTariffs";

const costsAndTariffsItems: ResponsiveNavigationItem<CostAndTariffsTab>[] = [
  {
    value: "networkCosts",
    testId: "network-costs-tab",
    label: (
      <Trans id="sunshine.costs-and-tariffs.network-costs">Network Costs</Trans>
    ),
  },
  {
    value: "netTariffs",
    testId: "net-tariffs-tab",
    label: (
      <Trans id="sunshine.costs-and-tariffs.net-tariffs">Net Tariffs</Trans>
    ),
  },
  {
    value: "energyTariffs",
    testId: "energy-tariffs-tab",
    label: (
      <Trans id="sunshine.costs-and-tariffs.energy-tariffs">
        Energy Tariffs
      </Trans>
    ),
  },
];

export const CostsAndTariffsNavigation: React.FC<{
  activeTab: string;
  handleTabChange: (
    event: React.SyntheticEvent,
    newValue: CostAndTariffsTab
  ) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <ResponsiveNavigation
      activeTab={activeTab as CostAndTariffsTab}
      items={costsAndTariffsItems}
      onChange={handleTabChange}
    />
  );
};

export type PowerStabilityTab = "saidi" | "saifi";

const powerStabilityItems: ResponsiveNavigationItem<PowerStabilityTab>[] = [
  {
    value: "saidi",
    testId: "saidi-tab",
    label: (
      <Trans id="sunshine.power-stability.saidi">
        Power Outage Duration (SAIDI)
      </Trans>
    ),
  },
  {
    value: "saifi",
    testId: "saifi-tab",
    label: (
      <Trans id="sunshine.power-stability.saifi">
        Power Outage Frequency (SAIFI)
      </Trans>
    ),
  },
];

export const PowerStabilityNavigation: React.FC<{
  activeTab: string;
  handleTabChange: (
    event: React.SyntheticEvent,
    newValue: PowerStabilityTab
  ) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <ResponsiveNavigation
      activeTab={activeTab as PowerStabilityTab}
      items={powerStabilityItems}
      onChange={handleTabChange}
    />
  );
};

export type OperationalStandardsTab = "outageInfo" | "compliance";

const operationalStandardsItems: ResponsiveNavigationItem<OperationalStandardsTab>[] =
  [
    {
      value: "outageInfo",
      testId: "outage-info-tab",
      label: (
        <Trans id="sunshine.operational-standards.service-quality">
          Service Quality
        </Trans>
      ),
    },
    {
      value: "compliance",
      testId: "compliance-tab",
      label: (
        <Trans id="sunshine.operational-standards.compliance">Compliance</Trans>
      ),
    },
  ];

export const OperationalStandardsNavigation: React.FC<{
  activeTab: OperationalStandardsTab;
  handleTabChange: (
    event: React.SyntheticEvent,
    newValue: OperationalStandardsTab
  ) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <ResponsiveNavigation
      activeTab={activeTab}
      items={operationalStandardsItems}
      onChange={handleTabChange}
    />
  );
};

type YearlyTab = `${number}`;

type YearlyNavigationProps = {
  activeTab: string;
  years: number[];
  handleTabChange: (event: React.SyntheticEvent, newValue: YearlyTab) => void;
};

export const YearlyNavigation: React.FC<
  YearlyNavigationProps & Omit<TabsProps, "onChange">
> = ({ activeTab, handleTabChange, years, ...props }) => {
  const items: ResponsiveNavigationItem<YearlyTab>[] = years.map((year) => ({
    value: `${year}` as YearlyTab,
    testId: `${year}-tab`,
    label: (
      <Trans id="sunshine.costs-and-tariffs.year" values={{ year }}>
        {year}
      </Trans>
    ),
  }));

  return (
    <ResponsiveNavigation
      activeTab={activeTab as YearlyTab}
      items={items}
      onChange={handleTabChange}
      {...props}
    />
  );
};
