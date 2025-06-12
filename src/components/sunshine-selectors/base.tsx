import { Trans, t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";

import { Combobox } from "src/components/combobox";

// Types for the props
export type SunshineSelectorsBaseProps = {
  year: string;
  setYear: (year: string) => void;
  years: string[];
  viewBy: string;
  setViewBy: (viewBy: string) => void;
  viewByOptions: string[];
  typology: string;
  setTypology: (typology: string) => void;
  typologyOptions: string[];
  indicator: string;
  setIndicator: (indicator: string) => void;
  indicatorOptions: string[];
  getItemLabel?: (id: string) => string;
};

export const SunshineSelectorsBase = ({
  year,
  setYear,
  years,
  viewBy,
  setViewBy,
  viewByOptions,
  typology,
  setTypology,
  typologyOptions,
  indicator,
  setIndicator,
  indicatorOptions,
  getItemLabel = (id) => id,
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
        getItemLabel={getItemLabel}
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
        id="typology"
        label={t({ id: "selector.typology", message: "Typology" })}
        items={typologyOptions}
        getItemLabel={getItemLabel}
        selectedItem={typology}
        setSelectedItem={setTypology}
        infoDialogSlug="help-typology"
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
    </Box>
  );
};
