import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import { I18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Box, List, ListItemButton } from "@mui/material";
import { Decorator } from "@storybook/react";
import * as turf from "@turf/turf";
import { easeExpIn, median } from "d3";
import { Feature, Geometry, MultiPolygon, Polygon } from "geojson";
import { groupBy, keyBy } from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";
import { ObjectInspector } from "react-inspector";
import { createClient, Provider } from "urql";

import { ChoroplethMap } from "src/components/map";
import { getFillColor, getZoomFromBounds } from "src/components/map-helpers";
import { MunicipalityFeatureCollection, useGeoData } from "src/data/geo";
import { useFetch } from "src/data/use-fetch";
import { useColorScale } from "src/domain/data";
import { useSunshineTariffQuery } from "src/graphql/queries";
import { SunshineDataRow } from "src/graphql/resolver-types";
import { truthy } from "src/lib/truthy";
import {
  getOperatorMunicipalities,
  OperatorMunicipalityRecord,
} from "src/rdf/queries";

import { props } from "./map.mock";

const TRANSPARENT = [255, 255, 255, 0] as [number, number, number, number];

const i18n = new I18n({
  locale: "en",
});

const colorAccessor = (d: { value: number }) => d.value;

export const Example = () => {
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
        <ChoroplethMap
          {...props}
          colorScale={colorScale}
          onMunicipalityLayerClick={() => {}}
        />
      </Box>
    </I18nProvider>
  );
};

const getOperatorsFeatureCollection = (
  operatorMunicipalities: OperatorMunicipalityRecord[],
  municipalities: MunicipalityFeatureCollection
) => {
  if (!operatorMunicipalities || !municipalities) return null;

  // Group municipalities by operator
  const municipalitiesByOperator = groupBy(operatorMunicipalities, "operator");

  const municipalitiesById = keyBy(municipalities.features, "id");
  const operatorFeatures = Object.entries(municipalitiesByOperator)
    .map(([operator, municipalities]) => {
      // Get geometry features for all municipalities of this operator
      const municipalityFeatures = municipalities
        .map((muni) => municipalitiesById[muni.municipality])
        .filter(Boolean);

      if (municipalityFeatures.length === 0) {
        console.warn(
          `No geometry found for operator ${operator} with municipalities: ${municipalities
            .map((m) => m.municipality)
            .join(", ")}`
        );
        return null;
      }
      const featureCollection = turf.featureCollection(
        municipalityFeatures.map((feat) =>
          turf.feature(feat.geometry as Polygon | MultiPolygon)
        )
      );

      const geometry =
        municipalityFeatures.length > 1
          ? turf.union(featureCollection)?.geometry
          : featureCollection.features[0].geometry;

      if (!geometry) {
        return null;
      }
      return {
        type: "Feature",
        properties: {
          operatorId: parseInt(operator, 10),
          municipalityCount: municipalities.length,
        },
        geometry: geometry,
      };
    })
    .filter(truthy);

  // Create the final GeoJSON
  return {
    type: "FeatureCollection",
    features: operatorFeatures,
  };
};

export const Operators = () => {
  const year = "2025";
  const { data: operatorMunicipalities } = useFetch({
    key: `operator-municipalities-${year}`,
    queryFn: () => getOperatorMunicipalities(year),
  });
  const { data: geoData } = useGeoData("2024");
  const [sunshineTarriffs] = useSunshineTariffQuery({
    variables: {
      filter: {
        period: "2024",
      },
    },
  });

  const sunshineTariffsByOperator = useMemo(() => {
    return keyBy(sunshineTarriffs.data?.sunshineTariffs ?? [], "operatorId");
  }, [sunshineTarriffs.data?.sunshineTariffs]);

  const attributes = [
    "tariffEC2",
    "tariffEC3",
    "tariffEC4",
    "tariffEC6",
    "tariffEH2",
    "tariffEH4",
    "tariffEH7",
    "tariffNC2",
    "tariffNC3",
    "tariffNC4",
    "tariffNC6",
    "tariffNH2",
    "tariffNH4",
    "tariffNH7",
    "saidiTotal",
    "saidiUnplanned",
    "saifiTotal",
    "saifiUnplanned",
  ] satisfies (keyof SunshineDataRow)[];
  type DisplayedAttribute = (typeof attributes)[number];
  const [attribute, setAttribute] = useState<DisplayedAttribute>(attributes[0]);

  type OperatorLayerProperties = { operatorId: number } | null;

  // TODO: Should come from Lindas, to ask
  const attributeMedian = useMemo(() => {
    const values = Object.values(sunshineTariffsByOperator).map(
      (x) => x[attribute]
    );
    return median(values);
  }, [attribute, sunshineTariffsByOperator]);

  const colorScale = useColorScale({
    observations: sunshineTarriffs.data?.sunshineTariffs ?? [],
    accessor: (x) => {
      return x.tariffEC2 ?? 0;
    },
    medianValue: attributeMedian,
  });

  const enhancedGeoData = useMemo(() => {
    if (!operatorMunicipalities || !geoData) {
      return null;
    }
    return getOperatorsFeatureCollection(
      operatorMunicipalities,
      geoData?.municipalities as MunicipalityFeatureCollection
    );
  }, [operatorMunicipalities, geoData]);

  const getMapFillColor = useCallback(
    (x: Feature<Geometry, OperatorLayerProperties>) => {
      if (!x.properties) {
        return TRANSPARENT;
      }
      const operatorId = x.properties.operatorId;
      const operator = sunshineTariffsByOperator[operatorId];
      if (!operator) {
        return TRANSPARENT;
      }
      const value = operator[attribute];
      if (value === null || value === undefined) {
        return TRANSPARENT;
      }
      const color = getFillColor(colorScale, value, false);
      return color;
    },
    [attribute, colorScale, sunshineTariffsByOperator]
  );

  const deckglRef = useRef<DeckGLRef>(null);
  return (
    <I18nProvider i18n={i18n}>
      <ObjectInspector data={sunshineTarriffs} />
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
            {attributes.map((attr) => (
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
          {/** Display merged operators geojson with DeckGl, with a tooltip */}
          {geoData && geoData.municipalities && enhancedGeoData ? (
            <DeckGL
              initialViewState={{
                latitude: 46.8182,
                longitude: 8.2275,
                zoom: 7,
                maxZoom: 16,
                minZoom: 2,
                pitch: 0,
                bearing: 0,
              }}
              controller={true}
              ref={deckglRef}
              layers={[
                // Municipality Layer
                new GeoJsonLayer<
                  Feature<Polygon | MultiPolygon, OperatorLayerProperties>
                >({
                  id: "operator-layer",
                  data: enhancedGeoData.features,
                  filled: true,
                  autoHighlight: true,
                  highlightColor: [0, 0, 0, 100],
                  updateTriggers: {
                    getFillColor: [getMapFillColor],
                  },
                  getFillColor: (x) => getMapFillColor(x),
                  getLineColor: [255, 255, 255],
                  pickable: true,
                  onClick: (info) => {
                    console.log("Clicked on operator:", info.object);
                    if (info.object && info.viewport) {
                      const bounds = turf.bbox(info.object.geometry);
                      deckglRef.current?.deck?.setProps({
                        viewState: {
                          longitude: (bounds[0] + bounds[2]) / 2,
                          latitude: (bounds[1] + bounds[3]) / 2,
                          zoom: getZoomFromBounds(bounds, info.viewport),
                          transitionDuration: 300,
                        },
                      });
                    }
                  },
                  transitions: {
                    getFillColor: {
                      duration: 300,
                      easing: easeExpIn,
                    },
                  },
                }),
                new GeoJsonLayer({
                  id: "municipality-layer",
                  data: geoData.municipalities.features,
                  filled: true,
                  getLineColor: [255, 255, 255],
                  getFillColor: TRANSPARENT,
                  highlightColor: [0, 0, 255],
                  lineWidthUnits: "pixels",
                  stroked: true,
                  autoHighlight: true,
                  getLineWidth: 0.5,
                }),
              ]}
            />
          ) : null}
        </Box>
      </Box>
    </I18nProvider>
  );
};

const BASE_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
const GRAPHQL_URL = `${BASE_URL}/api/graphql`;
console.log("GRAPHQL_URL", GRAPHQL_URL);
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

const meta = {
  component: ChoroplethMap,
  title: "components/Map",
  decorators: [UrqlDecorator],
};

export default meta;
