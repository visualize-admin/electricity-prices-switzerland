import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import {
  EnergyPricesMap,
  EnergyPricesMapProps,
} from "src/components/energy-prices-map";
import { Loading } from "src/components/hint";
import { MapProvider } from "src/components/map-context";
import { useGeoData } from "src/data/geo";
import { buildEnrichedEnergyPricesData } from "src/domain/energy-prices-map-data";
import { thresholdEncodings } from "src/domain/map-encodings";
import { PaperSize } from "src/domain/screenshot";
import { data as municipalities } from "src/mocks/graphql/map-2026-h4-total/AllMunicipalities";
import { data as observations } from "src/mocks/graphql/map-2026-h4-total/Observations";

import { withUrqlClient } from "../../.storybook/decorators";

import type { Meta, StoryObj } from "@storybook/react";

const PERIOD = "2026";

const enrichedData = buildEnrichedEnergyPricesData({
  observations: observations.observations,
  municipalities: municipalities.municipalities,
  cantonMedianObservations: observations.cantonMedianObservations,
  swissMedianObservations: observations.swissMedianObservations,
});

const enrichedDataQuery: EnergyPricesMapProps["enrichedDataQuery"] = {
  data: enrichedData,
  fetching: false,
  error: undefined,
  observationsQuery: { fetching: false, error: undefined, data: observations },
  municipalitiesQuery: {
    fetching: false,
    error: undefined,
    data: municipalities,
  },
};

const colorScale = thresholdEncodings
  .energyPrices(
    enrichedData.swissMedianObservations[0]?.value,
    enrichedData.observations
      .map((d) => d.value)
      .filter((value): value is number => value !== undefined && value !== null),
    +PERIOD
  )
  .makeScale();

const MapScreenshot = ({ paperSize }: { paperSize: PaperSize }) => {
  const controls: NonNullable<EnergyPricesMapProps["controls"]> = useRef(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [image, setImage] = useState<string>();
  const geoData = useGeoData(PERIOD);
  const [refreshCount, setRefreshCount] = useState(0);
  const refreshTimeout = useRef<number | undefined>(undefined);

  // Redraw the screenshot after zooming or moving the map, like a new download
  const refreshSoon = () => {
    window.clearTimeout(refreshTimeout.current);
    refreshTimeout.current = window.setTimeout(
      () => setRefreshCount((n) => n + 1),
      500
    );
  };

  useEffect(() => {
    if (geoData.state !== "loaded") return;
    let cancelled = false;
    setImage(undefined);
    controls.current?.getImageData(paperSize).then((url) => {
      if (!cancelled) setImage(url);
    });
    return () => {
      cancelled = true;
    };
  }, [paperSize, geoData.state, refreshCount]);

  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image);
    },
    [image]
  );

  useEffect(() => () => window.clearTimeout(refreshTimeout.current), []);

  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId}>
      <Box
        display="grid"
        gridTemplateColumns="2fr 3fr"
        gap={4}
        p={4}
        alignItems="start"
      >
        <Box
          position="relative"
          height="calc(100vh - 64px)"
          border={1}
          borderColor="divider"
          onPointerUp={refreshSoon}
        >
          <EnergyPricesMap
            enrichedDataQuery={enrichedDataQuery}
            colorScale={colorScale}
            controls={controls}
            period={PERIOD}
            priceComponent="total"
            entity="municipality"
            setEntity={() => {}}
          />
        </Box>
        <Box border={1} borderColor="divider">
          {image ? (
            <img
              src={image}
              alt="Map screenshot"
              style={{ display: "block", width: "100%" }}
            />
          ) : (
            <Loading />
          )}
        </Box>
      </Box>
    </MapProvider>
  );
};

const meta: Meta<typeof MapScreenshot> = {
  component: MapScreenshot,
  title: "Components/MapScreenshot",
  decorators: [withUrqlClient],
  parameters: {
    nextjs: {
      router: {
        query: {
          period: PERIOD,
          category: "H4",
          product: "standard",
          priceComponent: "total",
        },
      },
    },
  },
  argTypes: {
    paperSize: { control: "radio", options: ["small", "a4", "a3"] },
  },
};

export default meta;

export const EnergyPrices: StoryObj<typeof MapScreenshot> = {
  args: { paperSize: "small" },
};
