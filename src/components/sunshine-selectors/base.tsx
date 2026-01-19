import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import { Combobox, ComboboxItem } from "src/components/combobox";
import { ElectricityCategory, NetworkLevelId } from "src/domain/data";
import {
  QueryStateSunshineComplianceType,
  QueryStateSunshineSaidiSaifiType,
} from "src/domain/query-states";
import {
  getGroup,
  IndicatorGroup,
  SunshineIndicator,
} from "src/domain/sunshine";
import { TranslationKey } from "src/domain/translation";

type SunshineSelectorsBaseProps = {
  year: string;
  setYear: (year: string) => void;
  years: string[];
  peerGroup: string;
  setPeerGroup: (viewBy: string) => void;
  peerGroupOptions: string[];
  getPeerGroupLabel?: (id: string) => string;

  saidiSaifiType: QueryStateSunshineSaidiSaifiType;
  setSaidiSaifiType: (type: QueryStateSunshineSaidiSaifiType) => void;
  saidiSaifiTypes: QueryStateSunshineSaidiSaifiType[];

  complianceType: QueryStateSunshineComplianceType;
  setComplianceType: (typology: QueryStateSunshineComplianceType) => void;
  complianceTypes: QueryStateSunshineComplianceType[];

  indicator: SunshineIndicator;
  setIndicator: (indicator: SunshineIndicator) => void;
  indicatorOptions: SunshineIndicator[];
  getItemLabel?: (id: TranslationKey) => string;

  networkLevel: NetworkLevelId;
  setNetworkLevel: (networkLevel: NetworkLevelId) => void;
  networkLevelOptions: NetworkLevelId[];

  category: ElectricityCategory;
  setCategory: (category: ElectricityCategory) => void;
  categoryOptions: ElectricityCategory[];
};

export const SunshineSelectorsBase = ({
  year,
  setYear,
  years,
  peerGroup,
  setPeerGroup,
  peerGroupOptions,
  getPeerGroupLabel = (id) => id,
  saidiSaifiType,
  setSaidiSaifiType,
  saidiSaifiTypes,
  indicator,
  setIndicator,
  indicatorOptions,
  networkLevel,
  getItemLabel = (id) => id,
  networkLevelOptions,
  setNetworkLevel,
  category,
  setCategory,
  categoryOptions,
}: SunshineSelectorsBaseProps) => {
  const groupedIndicatorOptions =
    useMemo((): ComboboxItem<SunshineIndicator>[] => {
      const groupLabels: Record<IndicatorGroup, string> = {
        "costs-and-tariffs": t({
          id: "sunshine.costs-and-tariffs.title",
          message: "Costs and Tariffs",
        }),
        "power-stability": t({
          id: "sunshine.power-stability.title",
          message: "Power Stability",
        }),
        "operational-standards": t({
          id: "sunshine.operational-standards.title",
          message: "Operational Standards",
        }),
      };

      return indicatorOptions
        .filter(
          // Elcom has decided to not show these two indicators in the indicator selector
          (x) => x !== "outageInfo" && x !== "daysInAdvanceOutageNotification"
        )
        .map((value) => {
          const groupId = getGroup(value);
          const group = groupLabels[groupId];
          return { value, group };
        });
    }, [indicatorOptions]);

  return (
    <Box
      component="fieldset"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      gap={4}
      zIndex={13}
      p={0}
      m={0}
    >
      <Combobox
        id="year"
        label={t({ id: "selector.year", message: "Year" })}
        infoDialogSlug="help-year-indicators"
        items={years}
        selectedItem={year}
        setSelectedItem={setYear}
      />

      <Combobox
        id="indicator"
        label={t({ id: "selector.indicator", message: "Indicator" })}
        items={groupedIndicatorOptions}
        getItemLabel={(id) => {
          // Elcom has decided for franc-rule to be directly in the indicator selector
          // instead of compliance, so we map it here. It should be changed if in the future,
          // we show more "compliance" types on the map.
          if (id === "compliance") {
            return getItemLabel("franc-rule");
          }
          return getItemLabel(id);
        }}
        selectedItem={indicator}
        setSelectedItem={setIndicator}
        infoDialogSlug="help-indicator"
      />
      {indicator === "saifi" || indicator === "saidi" ? (
        <Combobox<QueryStateSunshineSaidiSaifiType>
          id="saidiSaifiType"
          label={t({ id: "selector.saidi-saifi-type", message: "Typology" })}
          items={saidiSaifiTypes}
          getItemLabel={getItemLabel}
          selectedItem={saidiSaifiType}
          setSelectedItem={setSaidiSaifiType}
          infoDialogSlug="help-saidi-saifi-type"
        />
      ) : null}

      {indicator === "networkCosts" ? (
        <Combobox<NetworkLevelId>
          id="networkLevel"
          label={t({ id: "selector.network-level", message: "Network level" })}
          items={networkLevelOptions}
          getItemLabel={(x) => getItemLabel(`network-level.${x}.short`)}
          selectedItem={networkLevel}
          setSelectedItem={setNetworkLevel}
          infoDialogSlug="help-network-level"
        />
      ) : null}
      {indicator === "netTariffs" ? (
        <Combobox<ElectricityCategory>
          id="net-tariffs-category"
          label={t({
            id: "selector.net-tariffs-category",
            message: "Category",
          })}
          items={categoryOptions}
          getItemLabel={getItemLabel}
          selectedItem={category}
          setSelectedItem={setCategory}
          infoDialogSlug="help-categories"
        />
      ) : null}
      {indicator === "energyTariffs" ? (
        <Combobox
          id="energy-tariffs-category"
          label={t({
            id: "selector.energy-tariffs-category",
            message: "Category",
          })}
          items={categoryOptions}
          getItemLabel={getItemLabel}
          selectedItem={category}
          setSelectedItem={setCategory}
          infoDialogSlug="help-categories"
        />
      ) : null}

      <Combobox
        id="peer-group"
        label={t({ id: "selector.peerGroup", message: "Peer Group" })}
        items={peerGroupOptions}
        getItemLabel={getPeerGroupLabel}
        selectedItem={peerGroup}
        setSelectedItem={setPeerGroup}
        infoDialogSlug="help-peer-group"
      />
    </Box>
  );
};
