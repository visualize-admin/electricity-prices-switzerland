import { Box, List, ListItemButton } from "@mui/material";
import { Decorator } from "@storybook/react";
import { median } from "d3";
import { useMemo, useState } from "react";
import { createClient, Provider } from "urql";

import { ChoroplethMap } from "src/components/map";
import { MapProvider } from "src/components/map-context";
import OperatorsMap, {
  DisplayedAttribute,
  displayedAttributes,
} from "src/components/operators-map";
import { useColorScale } from "src/domain/data";
import { useSunshineTariffQuery } from "src/graphql/queries";

export const Operators = () => {
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
  const attributeMedian = useMemo(() => {
    const values = observations.map((x) => x[attribute]);
    return median(values);
  }, [attribute, observations]);

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
          <OperatorsMap
            period={period}
            attribute={attribute}
            colorScale={colorScale}
            observations={observations}
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
  component: ChoroplethMap,
  title: "components/Map",
  decorators: [UrqlDecorator, MapDecorator],
};

export default meta;
