import { I18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Box } from "@mui/material";
import { useCallback } from "react";

import { ChoroplethMap } from "src/components/map";
import { useColorScale } from "src/domain/data";

import { props } from "./map.mock";

const i18n = new I18n({
  locale: "en",
});

export const Example = () => {
  const colorAccessor = useCallback((d: { value: number }) => d.value, []);
  const colorScale = useColorScale({
    observations: props.observations,
    medianValue: props.medianValue,
    accessor: colorAccessor,
  });
  return (
    <I18nProvider i18n={i18n}>
      <Box
        width="800px"
        height="800px"
        position="relative"
        sx={{
          "& #deckgl-wrapper": {
            width: "100%",
            height: "100%",
          },
        }}
      >
        <ChoroplethMap {...props} colorScale={colorScale} />
      </Box>
    </I18nProvider>
  );
};

const meta = {
  component: ChoroplethMap,
  title: "components/Map",
};

export default meta;
