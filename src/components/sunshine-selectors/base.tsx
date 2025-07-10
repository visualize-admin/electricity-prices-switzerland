import { t } from "@lingui/macro";
import { Box } from "@mui/material";

import { Combobox } from "src/components/combobox";
import { QueryStateSunshineSaidiSaifiTypology } from "src/domain/query-states";
import { SunshineIndicator } from "src/domain/sunshine";

type SunshineSelectorsBaseProps = {
  year: string;
  setYear: (year: string) => void;
  years: string[];
  peerGroup: string;
  setPeerGroup: (viewBy: string) => void;
  peerGroupOptions: string[];
  getPeerGroupLabel?: (id: string) => string;
  typology: QueryStateSunshineSaidiSaifiTypology;
  setTypology: (typology: QueryStateSunshineSaidiSaifiTypology) => void;
  typologyOptions: QueryStateSunshineSaidiSaifiTypology[];
  indicator: SunshineIndicator;
  setIndicator: (indicator: SunshineIndicator) => void;
  indicatorOptions: SunshineIndicator[];
  getItemLabel?: (id: string) => string;
  networkLevel: string;
  setNetworkLevel: (networkLevel: string) => void;
  networkLevelOptions: string[];

  netElectricityCategory: string;
  setNetElectricityCategory: (category: string) => void;
  netTariffsCategoryOptions: string[];

  energyElectricityCategory: string;
  energyTariffsCategoryOptions: string[];
  setEnergyElectricityCategory: (category: string) => void;
};

export const SunshineSelectorsBase = ({
  year,
  setYear,
  years,
  peerGroup,
  setPeerGroup,
  peerGroupOptions,
  getPeerGroupLabel = (id) => id,
  typology,
  setTypology,
  typologyOptions,
  indicator,
  setIndicator,
  indicatorOptions,
  networkLevel,
  getItemLabel = (id) => id,
  networkLevelOptions,
  setNetworkLevel,
  netElectricityCategory,
  setNetElectricityCategory,
  netTariffsCategoryOptions,
  energyElectricityCategory,
  energyTariffsCategoryOptions,
  setEnergyElectricityCategory,
}: SunshineSelectorsBaseProps) => {
  return (
    <Box
      component="fieldset"
      sx={{
        border: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        px: 6,
        pt: 6,
        pb: 4,
        gap: 4,
        zIndex: 13,
      }}
      display="flex"
    >
      <Combobox
        id="viewBy"
        label={t({ id: "selector.peerGroup", message: "View by" })}
        items={peerGroupOptions}
        getItemLabel={getPeerGroupLabel}
        selectedItem={peerGroup}
        setSelectedItem={setPeerGroup}
      />

      <Combobox
        id="year"
        label={t({ id: "selector.year", message: "Year" })}
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
        <Combobox<QueryStateSunshineSaidiSaifiTypology>
          id="typology"
          label={t({ id: "selector.typology", message: "Typology" })}
          items={typologyOptions}
          getItemLabel={getItemLabel}
          selectedItem={typology}
          setSelectedItem={setTypology}
          infoDialogSlug="help-typology"
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
          items={netTariffsCategoryOptions}
          getItemLabel={getItemLabel}
          selectedItem={netElectricityCategory}
          setSelectedItem={setNetElectricityCategory}
          infoDialogSlug="help-net-tariff-category"
        />
      ) : null}
      {indicator === "energyTariffs" ? (
        <Combobox
          id="energy-tariffs-category"
          label={t({
            id: "selector.energy-tariffs-category",
            message: "Category",
          })}
          items={energyTariffsCategoryOptions}
          getItemLabel={getItemLabel}
          selectedItem={energyElectricityCategory}
          setSelectedItem={setEnergyElectricityCategory}
          infoDialogSlug="help-energy-tariff-category"
        />
      ) : null}
    </Box>
  );
};
