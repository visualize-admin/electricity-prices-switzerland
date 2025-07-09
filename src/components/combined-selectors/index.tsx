import { t, Trans } from "@lingui/macro";
import { Box, BoxProps, Typography, useTheme } from "@mui/material";

import { ButtonGroup } from "src/components/button-group";
import { ElectricitySelectors } from "src/components/electricity-selectors";
import { SunshineSelectors } from "src/components/sunshine-selectors";
import { useQueryStateMapCommon } from "src/domain/query-states";
import { useFlag } from "src/utils/flags";

type TabValue = "electricity" | "sunshine";

export const CombinedSelectors = (props: BoxProps) => {
  const [queryState, setQueryState] = useQueryStateMapCommon();
  const activeTab = queryState.tab as TabValue;

  const sunshineFlag = useFlag("sunshine");
  const theme = useTheme();

  return (
    <Box
      {...props}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        ...props.sx,
        "--selector-panel-padding-x": theme.spacing(6),
      }}
    >
      <Box sx={{ px: "var(--selector-panel-padding-x)", pb: 4 }}>
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
      </Box>
      {sunshineFlag ? (
        <Box sx={{ px: "var(--selector-panel-padding-x)", width: "100%" }}>
          <ButtonGroup
            id="data-view-selector"
            options={[
              {
                value: "electricity",
                label: t({
                  id: "selector.tab.electricity",
                  message: "Electricity Tariffs",
                }),
              },
              {
                value: "sunshine",
                label: t({
                  id: "selector.tab.indicators",
                  message: "Indicators",
                }),
              },
            ]}
            value={activeTab}
            setValue={(newValue) => setQueryState({ tab: newValue })}
            sx={{ width: "100%" }}
          />
        </Box>
      ) : null}

      {activeTab === "electricity" ? (
        <ElectricitySelectors />
      ) : (
        <SunshineSelectors />
      )}
    </Box>
  );
};
