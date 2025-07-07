import { Trans, t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";

import { Combobox } from "src/components/combobox";
import {
  SunshineIndicator,
  QueryStateSunshineSaidiSaifiTypology,
} from "src/domain/query-states";

type SunshineSelectorsBaseProps = {
  year: string;
  setYear: (year: string) => void;
  years: string[];
  viewBy: string;
  setViewBy: (viewBy: string) => void;
  viewByOptions: string[];
  getViewByLabel?: (id: string) => string;
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

  netTariffCategory: string;
  setNetTariffCategory: (category: string) => void;
  netTariffsCategoryOptions: string[];

  energyTariffCategory: string;
  energyTariffsCategoryOptions: string[];
  setEnergyTariffCategory: (category: string) => void;
};

export const SunshineSelectorsBase = ({
  year,
  setYear,
  years,
  viewBy,
  setViewBy,
  viewByOptions,
  getViewByLabel = (id) => id,
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
  netTariffCategory,
  setNetTariffCategory,
  netTariffsCategoryOptions,
  energyTariffCategory,
  energyTariffsCategoryOptions,
  setEnergyTariffCategory,
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
      <Typography
        component="legend"
        variant="body2"
        fontWeight={700}
        sx={{ display: "contents" }}
      >
        <Trans id="selector.legend.select.parameters">
          Filter list and map
        </Trans>
      </Typography>

      <Combobox
        id="viewBy"
        label={t({ id: "selector.viewBy", message: "View by" })}
        items={viewByOptions}
        getItemLabel={getViewByLabel}
        selectedItem={viewBy}
        setSelectedItem={setViewBy}
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
          selectedItem={netTariffCategory}
          setSelectedItem={setNetTariffCategory}
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
          selectedItem={energyTariffCategory}
          setSelectedItem={setEnergyTariffCategory}
          infoDialogSlug="help-energy-tariff-category"
        />
      ) : null}
    </Box>
  );
};
