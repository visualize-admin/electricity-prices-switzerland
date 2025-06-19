import { t } from "@lingui/macro";
import { Box, Tab, Tabs } from "@mui/material";
import { useCallback } from "react";

import { ElectricitySelectors } from "src/components/electricity-selectors";
import { SunshineSelectors } from "src/components/sunshine-selectors";
import { useQueryStateSingleCommon } from "src/lib/use-query-state";
import { useFlag } from "src/utils/flags";

type TabValue = "electricity" | "sunshine";

export const CombinedSelectors = () => {
  const [queryState, setQueryState] = useQueryStateSingleCommon();
  const activeTab = queryState.tab as TabValue;

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: TabValue) => {
      console.log("Tab changed to:", newValue);
      setQueryState({ tab: newValue });
    },
    [setQueryState]
  );

  const sunshineFlag = useFlag("sunshine");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {sunshineFlag ? (
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Data view selector tabs"
            variant="fullWidth"
          >
            <Tab
              label={t({
                id: "selector.tab.electricity",
                message: "Electricity Tariffs",
              })}
              value="electricity"
            />
            <Tab
              label={t({
                id: "selector.tab.indicators",
                message: "Indicators",
              })}
              value="sunshine"
            />
          </Tabs>
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
