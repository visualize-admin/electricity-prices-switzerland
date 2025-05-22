import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL from "@deck.gl/react/typed";
import { I18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Box } from "@mui/material";
import { Decorator } from "@storybook/react";
import * as turf from "@turf/turf";
import { MultiPolygon, Polygon } from "geojson";
import { groupBy, keyBy } from "lodash";
import { useMemo } from "react";
import { ObjectInspector } from "react-inspector";
import { createClient, Provider } from "urql";

import { ChoroplethMap } from "src/components/map";
import { getFillColor } from "src/components/map-helpers";
import { useGeoData } from "src/data/geo";
import { useFetch } from "src/data/use-fetch";
import { useColorScale } from "src/domain/data";
import { useSunshineTariffQuery } from "src/graphql/queries";
import { truthy } from "src/lib/truthy";
import { getOperatorMunicipalities } from "src/rdf/queries";

import { props } from "./map.mock";

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

  const colorScale = useColorScale({
    observations: sunshineTarriffs.data?.sunshineTariffs ?? [],
    accessor: (x) => {
      return x.tariffEC2 ?? 0;
    },
  });

  const enhancedGeoData = useMemo(() => {
    if (!operatorMunicipalities || !geoData) return null;

    // Group municipalities by operator
    const municipalitiesByOperator = groupBy(
      operatorMunicipalities,
      "operator"
    );

    // Index original municipalities by ID for quick lookup
    const municipalitiesById = keyBy(geoData.municipalities.features, "id");

    // Create a municipality collection for each operator
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

        // Create a feature collection from the municipality features
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

        // Create a feature for this operator with the merged geometry
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
  }, [operatorMunicipalities, geoData]);

  return (
    <I18nProvider i18n={i18n}>
      <ObjectInspector data={sunshineTarriffs} />
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
        <Box width={800} height={800} border="1px solid red">
          {/** Display merged operators geojson with DeckGl, with a tooltip */}
          {geoData && geoData.municipalities && enhancedGeoData ? (
            <DeckGL
              getTooltip={(info) => {
                if (!info.object) {
                  return false;
                }
                return info.object.properties.name ?? "";
              }}
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
              layers={[
                // Municipality Layer
                // new GeoJsonLayer({
                //   id: "municipality-layer",
                //   data: geoData.municipalities,
                //   filled: true,
                //   getFillColor: [255, 0, 0],
                //   getLineColor: [255, 255, 255],
                //   highlightColor: [0, 0, 255],
                //   autoHighlight: true,
                //   getLineWidth: 10,
                //   pickable: true,
                //   onClick: (info) => {
                //     console.log("Clicked on municipality:", info.object);
                //   },
                // }),
                new GeoJsonLayer({
                  id: "operator-layer",
                  data: enhancedGeoData.features,
                  filled: true,
                  autoHighlight: true,
                  highlightColor: [0, 0, 255],
                  updateTriggers: {
                    getFillColor: [colorScale, sunshineTariffsByOperator],
                  },
                  getFillColor: (x) => {
                    const operatorId = x.properties.operatorId;
                    console.log("x", x, sunshineTariffsByOperator);
                    const operator = sunshineTariffsByOperator[operatorId];
                    if (!operator) {
                      return [255, 0, 0];
                    }
                    const tariff = operator.tariffEC2;
                    console.log("tariff", tariff);
                    if (tariff === null || tariff === undefined) {
                      return [255, 0, 0];
                    }
                    const color = getFillColor(colorScale, tariff, false);
                    return color;
                  },
                  getLineColor: [255, 255, 255],
                  pickable: true,
                  onClick: (info) => {
                    console.log("Clicked on operator:", info.object);
                  },
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
