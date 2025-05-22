import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import { I18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Box, List, ListItemButton } from "@mui/material";
import { Decorator } from "@storybook/react";
import * as turf from "@turf/turf";
import { easeExpIn, mean, median, sort } from "d3";
import {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
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
  ElectricityCategory,
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

type OperatorLayerProperties = {
  municipalityCount: number;
  operators: number[];
};

const multiGroupBy = <T,>(arr: T[], iter: (item: T) => string[]) => {
  const res: Record<string, T[]> = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const keys = iter(item);
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      if (!res[key]) {
        res[key] = [];
      }
      res[key].push(item);
    }
  }
  return res;
};

const getOperatorsFeatureCollection = (
  operatorMunicipalities: OperatorMunicipalityRecord[],
  municipalities: MunicipalityFeatureCollection
): FeatureCollection<
  MultiPolygon | Polygon,
  OperatorLayerProperties
> | null => {
  if (!operatorMunicipalities || !municipalities) return null;

  const operatorsByMunicipality = groupBy(
    operatorMunicipalities,
    "municipality"
  );
  const municipalitySet = Array.from(
    new Set(operatorMunicipalities.map((x) => x.municipality))
  );

  // Group municipalities by operator, a municipality will be part of several groups if it
  // has several operators, the groups are sorted so that the multiple operators are last
  // Example: Kilchberg is served by EWL and EWA, it will be part of 3 groups
  // EWL, EWA, EWL/EWA
  const municipalitiesByOperators = multiGroupBy(municipalitySet, (x) => {
    const operatorIds = operatorsByMunicipality[x].map((x) => x.operator);
    const all = sort(operatorIds).join("/");
    return [...operatorIds, all];
  });

  const municipalitiesById = keyBy(municipalities.features, "id");
  const operatorFeatures = Object.entries(municipalitiesByOperators)
    .map(([operators, municipalities]) => {
      // Get geometry features for all municipalities of this operator
      const municipalityFeatures = municipalities
        .map((muni) => municipalitiesById[muni])
        .filter(Boolean);

      if (municipalityFeatures.length === 0) {
        console.warn(
          `No geometry found for operator ${operators} with municipalities: ${municipalities
            .map((m) => m)
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
        type: "Feature" as const,
        properties: {
          operators: operators.split("/").map((x) => parseInt(x, 10)),
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

const sunshineAttributeToElectricityCategory: Partial<
  Record<keyof SunshineDataRow, ElectricityCategory>
> = {
  tariffEC2: "C2",
  tariffEC3: "C3",
  tariffEC4: "C4",
  tariffEC6: "C6",
  tariffEH2: "H2",
  tariffEH4: "H4",
  tariffEH7: "H7",
  tariffNC2: "C2",
  tariffNC3: "C3",
  tariffNC4: "C4",
  tariffNC6: "C6",
  tariffNH2: "H2",
  tariffNH4: "H4",
  tariffNH7: "H7",
};

const displayedAttributes = [
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

type DisplayedAttribute = (typeof displayedAttributes)[number];

export const Operators = () => {
  const period = "2024";
  const [attribute, setAttribute] = useState<DisplayedAttribute>(
    displayedAttributes[0]
  );

  const electricityCategory =
    sunshineAttributeToElectricityCategory[attribute] ?? "all";
  const { data: operatorMunicipalities } = useFetch({
    key: `operator-municipalities-${period}-${electricityCategory}`,
    queryFn: () => getOperatorMunicipalities(period, electricityCategory),
  });
  const { data: geoData } = useGeoData(period);
  const [sunshineTarriffs] = useSunshineTariffQuery({
    variables: {
      filter: {
        period: period,
      },
    },
  });

  const sunshineTariffsByOperator = useMemo(() => {
    return keyBy(sunshineTarriffs.data?.sunshineTariffs ?? [], "operatorId");
  }, [sunshineTarriffs.data?.sunshineTariffs]);

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
      const operatorIds = x.properties.operators;
      const values = operatorIds
        .map((x) => {
          const op = sunshineTariffsByOperator[x];
          return op?.[attribute] ?? null;
        })
        .filter(truthy);
      if (values.length === 0) {
        return TRANSPARENT;
      }
      const value = mean(values);
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
              getTooltip={({ object }) => {
                if (!object) {
                  return null;
                }
                const operatorIds = (
                  object.properties as OperatorLayerProperties
                )?.operators;
                return {
                  html: `<div>${operatorIds.join("<br/>")}</div>`,
                  style: {
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "12px",
                    padding: "5px",
                  },
                };
              }}
              controller={true}
              ref={deckglRef}
              layers={[
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
                  getLineColor: [255, 255, 255, 100],
                  getLineWidth: 1.5,
                  lineWidthUnits: "pixels",
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

                // Transparent layers for hover effect
                new GeoJsonLayer<
                  Feature<Polygon | MultiPolygon, OperatorLayerProperties>
                >({
                  id: "operator-layer-pickable",
                  data: enhancedGeoData.features,

                  filled: true,
                  autoHighlight: true,
                  stroked: false,
                  highlightColor: [0, 0, 0, 100],
                  updateTriggers: {
                    getFillColor: [getMapFillColor],
                  },
                  getFillColor: TRANSPARENT,
                  lineWidthUnits: "pixels",
                  pickable: true,
                }),

                // Municipality Layer
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
                  getLineWidth: 0.25,
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
