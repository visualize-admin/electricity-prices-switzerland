import { t } from "@lingui/macro";
import { Box } from "@mui/material";

import { Combobox } from "src/components/combobox";
import {
  QueryStateSunshineComplianceType,
  QueryStateSunshineSaidiSaifiType,
} from "src/domain/query-states";
import { SunshineIndicator } from "src/domain/sunshine";

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
  getItemLabel?: (id: string) => string;
  networkLevel: string;
  setNetworkLevel: (networkLevel: string) => void;
  networkLevelOptions: string[];

  category: string;
  setCategory: (category: string) => void;
  categoryOptions: string[];
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
  complianceType,
  complianceTypes,
  setComplianceType,
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
  return (
    <Box
      component="fieldset"
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 3,
        zIndex: 13,
        p: 0,
        m: 0,
      }}
      display="flex"
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
        items={indicatorOptions}
        getItemLabel={getItemLabel}
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
      {indicator === "compliance" ? (
        <Combobox<QueryStateSunshineComplianceType>
          id="typology"
          label={t({ id: "selector.compliance-type", message: "Typology" })}
          items={complianceTypes}
          getItemLabel={getItemLabel}
          selectedItem={complianceType}
          setSelectedItem={setComplianceType}
        />
      ) : null}

      {indicator === "networkCosts" ? (
        <Combobox
          id="networkLevel"
          label={t({ id: "selector.network-level", message: "Network level" })}
          items={networkLevelOptions}
          getItemLabel={getItemLabel}
          selectedItem={networkLevel}
          setSelectedItem={setNetworkLevel}
          infoDialogSlug="help-network-level"
        />
      ) : null}
      {indicator === "netTariffs" ? (
        <Combobox
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
