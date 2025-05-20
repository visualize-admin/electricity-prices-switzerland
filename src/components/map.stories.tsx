import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL from "@deck.gl/react/typed";
import { I18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Box } from "@mui/material";
import * as turf from "@turf/turf";
import { MultiPolygon, Polygon } from "geojson";
import { groupBy, keyBy } from "lodash";
import { useMemo } from "react";

import { ChoroplethMap } from "src/components/map";
import { useGeoData } from "src/data/geo";
import { useFetch } from "src/data/use-fetch";
import { useColorScale } from "src/domain/data";
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

export const OperatorsFromData = () => {
  const year = "2025";
  const { data: operatorMunicipalities } = useFetch({
    key: `operator-municipalities-${year}`,
    queryFn: () => getOperatorMunicipalities(year),
  });
  const { data: geoData } = useGeoData("2024");
  const colorScale = useColorScale({
    observations: [],
    medianValue: 0,
    accessor: colorAccessor,
  });

  // Create a GeoJSON where municipalities are grouped by operator
  const enhancedGeoData = useMemo(() => {
    if (!operatorMunicipalities || !geoData) return null;

    // Group municipalities by operator
    const municipalitiesByOperator = groupBy(
      operatorMunicipalities,
      "operator"
    );

    // Index original municipalities by ID for quick lookup
    const municipalitiesById = keyBy(geoData.municipalities.features, "id");
    // Create a new feature collection for each operator
    const operatorFeatures = Object.entries(municipalitiesByOperator)
      .map(([operator, municipalities]) => {
        // Get geometry features for all municipalities of this operator
        const municipalityFeatures = municipalities
          .map((muni) => municipalitiesById[muni.municipality])
          .filter(Boolean); // Filter out undefined/null values

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

        // Create a feature for this operator with the merged geometry
        return {
          type: "Feature",
          properties: {
            name: operator,
            municipalityCount: municipalities.length,
          },
          geometry:
            municipalityFeatures.length > 1
              ? turf.union(featureCollection)?.geometry
              : featureCollection.features[0].geometry,
        };
      })
      .filter(Boolean);

    // Create the final GeoJSON
    return {
      type: "FeatureCollection",
      features: operatorFeatures,
    };
  }, [operatorMunicipalities, geoData]);

  console.log({ enhancedGeoData });
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
        <Box width={800} height={800} border="1px solid red">
          {/** Display merged operators geojson with DeckGl, with a tooltip */}
          {geoData && geoData.municipalities && enhancedGeoData ? (
            <DeckGL
              getTooltip={(info) => {
                if (!info.object) {
                  return false;
                }
                console.log("Tooltip info:", info.object.properties);
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
                  getFillColor: [0, 255, 0, 100],
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

const meta = {
  component: ChoroplethMap,
  title: "components/Map",
  decorators: [],
};

export default meta;
