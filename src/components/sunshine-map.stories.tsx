import { Box, List, ListItemButton } from "@mui/material";
import { Decorator } from "@storybook/react";
import { median } from "d3";
import { useCallback, useMemo, useState } from "react";
import { createClient, Provider } from "urql";

import { MapProvider } from "src/components/map-context";
import SunshineMapComponent, {
  DisplayedAttribute,
  displayedAttributes,
  GetOperatorsMapTooltip,
} from "src/components/sunshine-map";
import { useColorScale } from "src/domain/data";
import { SunshineDataRow, useSunshineTariffQuery } from "src/graphql/queries";
import { exchanges } from "src/graphql/urql-exchanges.browser";

const debugTooltip: GetOperatorsMapTooltip = ({ object }) => {
  if (!object) {
    return null;
  }
  const operatorIds = object.properties?.operators;
  return {
    html: `<div>${operatorIds.join("<br/>")}</div>`,
    style: {
      backgroundColor: "white",
      color: "black",
      fontSize: "12px",
      padding: "5px",
    },
  };
};
export const SunshineMap = () => {
  const period = "2024";
  const [attribute, setAttribute] = useState<DisplayedAttribute>(
    displayedAttributes[0]
  );

  const [{ data }] = useSunshineTariffQuery({
    variables: {
      filter: {
        period: period,
      },
    },
  });

  const observations = useMemo(() => data?.sunshineTariffs ?? [], [data]);

  // TODO: Should come from Lindas, to ask
  const accessor = useCallback(
    (d: SunshineDataRow) => {
      return d[attribute];
    },
    [attribute]
  );

  const attributeMedian = useMemo(() => {
    const values = observations.map(accessor);
    return median(values);
  }, [accessor, observations]);

  const colorScale = useColorScale({
    observations: observations,
    accessor: (x) => {
      return x.tariffEC2 ?? 0;
    },
    medianValue: attributeMedian,
  });

  return (
    <>
      Attribute selection
      <Box
        width="800px"
        height="800px"
        display="grid"
        gridTemplateColumns={"300px 1fr"}
        position="relative"
        sx={{
          "& #deckgl-wrapper": {
            width: "100%",
            height: "100%",
          },
        }}
      >
        <Box>
          <List>
            {displayedAttributes.map((attr) => (
              <ListItemButton
                key={attr}
                selected={attribute === attr}
                onClick={() => setAttribute(attr)}
              >
                {attr}
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Box width={800} height={800} position="relative">
          <SunshineMapComponent
            period={period}
            accessor={accessor}
            colorScale={colorScale}
            observations={observations}
            getTooltip={debugTooltip}
          />
        </Box>
      </Box>
    </>
  );
};

const BASE_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
const GRAPHQL_URL = `${BASE_URL}/api/graphql`;

const client = createClient({
  url: GRAPHQL_URL,
  exchanges: exchanges,
});
const UrqlDecorator: Decorator = (Story) => {
  return (
    <Provider value={client}>
      <Story />
    </Provider>
  );
};

const MapDecorator: Decorator = (Story) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId}>
      <Story />
    </MapProvider>
  );
};

const meta = {
  component: SunshineMapComponent,
  title: "components/SunshineMap",
  decorators: [UrqlDecorator, MapDecorator],
};

export default meta;
