import { Box, BoxProps, ButtonGroupProps } from "@mui/material";

import { ButtonGroup } from "src/components/button-group";
import { ElectricitySelectors } from "src/components/electricity-selectors";
import { SunshineSelectors } from "src/components/sunshine-selectors";
import { useQueryStateMapCommon } from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import { useFlag } from "src/utils/flags";

type TabValue = "electricity" | "sunshine";

export const ElectricityOrSunshineButtonGroup = (
  props: Omit<ButtonGroupProps, "value" | "setValue" | "options">
) => {
  const [queryState, setQueryState] = useQueryStateMapCommon();
  const activeTab = queryState.tab as TabValue;
  return (
    <ButtonGroup
      id="data-view-selector"
      options={[
        {
          value: "electricity",
          label: getLocalizedLabel({ id: "selector-tab.electricity" }),
          content: getLocalizedLabel({
            id: "selector-tab.electricity-content",
          }),
        },
        {
          value: "sunshine",
          label: getLocalizedLabel({ id: "selector-tab.indicators" }),
          content: getLocalizedLabel({
            id: "selector-tab.indicators-content",
          }),
        },
      ]}
      value={activeTab}
      setValue={(newValue) => setQueryState({ tab: newValue })}
      width="100%"
      {...props}
    />
  );
};

export const CombinedSelectors = ({
  showTabs = true,
  ...props
}: BoxProps & { showTabs?: boolean }) => {
  const [queryState] = useQueryStateMapCommon();
  const activeTab = queryState.tab as TabValue;

  const sunshineFlag = useFlag("sunshine");

  return (
    <Box
      {...props}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        ...props.sx,
        mb: 6,
      }}
    >
      {sunshineFlag && showTabs ? (
        <Box sx={{ width: "100%", mb: 2 }}>
          <ElectricityOrSunshineButtonGroup />
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
