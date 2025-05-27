import { FeatureCollection, Polygon } from "geojson";
import { describe, expect, test } from "vitest";

import { OperatorMunicipalityRecord } from "src/rdf/queries";

import { getOperatorsFeatureCollection } from "./geo";

describe("getOperatorsFeatureCollection", () => {
  // Mock municipality features with simple bounds
  const mockMunicipalityFeatures = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "101", // municipality 1
        properties: { id: "101" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [0, 0],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "102", // municipality 2
        properties: { id: "102" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [1, 0],
              [1, 1],
              [2, 1],
              [2, 0],
              [1, 0],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "103", // municipality 3
        properties: { id: "103" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [2, 0],
              [2, 1],
              [3, 1],
              [3, 0],
              [2, 0],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "104", // municipality 4
        properties: { id: "104" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [3, 0],
              [3, 1],
              [4, 1],
              [4, 0],
              [3, 0],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "105", // municipality 5
        properties: { id: "105" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [4, 0],
              [4, 1],
              [5, 1],
              [5, 0],
              [4, 0],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "106", // municipality 6
        properties: { id: "106" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [5, 0],
              [5, 1],
              [6, 1],
              [6, 0],
              [5, 0],
            ],
          ],
        },
      },
    ],
  } as FeatureCollection<Polygon, { id: string }>;

  // Mock operator-municipality relationships
  const mockOperatorMunicipalities: OperatorMunicipalityRecord[] = [
    // municipality 1 is served by operator 1
    { operator: "1", municipality: 101, canton: "1" },

    // municipality 2 is served by operator 2
    { operator: "2", municipality: 102, canton: "1" },

    // municipality 3 is served by operators 3 and 4
    { operator: "3", municipality: 103, canton: "1" },
    { operator: "4", municipality: 103, canton: "1" },

    // municipalities 4 and 5 are served by operators 5 and 6
    { operator: "5", municipality: 104, canton: "1" },
    { operator: "6", municipality: 104, canton: "1" },
    { operator: "5", municipality: 105, canton: "1" },
    { operator: "6", municipality: 105, canton: "1" },

    // municipality 6 is served by operators 7 and 8
    { operator: "7", municipality: 106, canton: "1" },
    { operator: "8", municipality: 106, canton: "1" },
  ];

  test("should create empty feature collection when no data is provided", () => {
    const result = getOperatorsFeatureCollection([], mockMunicipalityFeatures);
    expect(result.type).toBe("FeatureCollection");
    expect(result.features).toHaveLength(0);

    const emptyMunicipalityFeaturesResult = getOperatorsFeatureCollection([], {
      features: [],
      type: "FeatureCollection",
    });
    expect(emptyMunicipalityFeaturesResult.type).toBe("FeatureCollection");
    expect(emptyMunicipalityFeaturesResult.features).toHaveLength(0);
  });

  test("should create feature for a municipality served by a single operator", () => {
    const result = getOperatorsFeatureCollection(
      mockOperatorMunicipalities.filter((r) => r.municipality === 101),
      mockMunicipalityFeatures
    );

    expect(result.features).toHaveLength(1);

    const feature = result.features[0];
    expect(feature.properties.operators).toEqual([1]);
    expect(feature.properties.municipalities.length).toBe(1);

    // Should use the municipality polygon as is
    expect(feature.geometry.type).toBe("Polygon");
    expect(feature.geometry.coordinates).toEqual([
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ]);
  });

  test("should create features for a municipality served by multiple operators", () => {
    const result = getOperatorsFeatureCollection(
      mockOperatorMunicipalities.filter((r) => r.municipality === 103),
      mockMunicipalityFeatures
    );

    // Should create 3 features: one for each operator and one for the combination
    expect(result.features).toHaveLength(3);

    // Check individual operator features
    const operatorFeatures = result.features.filter(
      (f) => f.properties.operators.length === 1
    );
    expect(operatorFeatures).toHaveLength(2);

    const operatorIds = operatorFeatures
      .map((f) => f.properties.operators[0])
      .sort();
    expect(operatorIds).toEqual([3, 4]);

    // Check combined feature
    const combinedFeature = result.features.find(
      (f) => f.properties.operators.length > 1
    );
    expect(combinedFeature).toBeDefined();
    expect(combinedFeature?.properties.operators).toEqual([3, 4]);
    expect(combinedFeature?.properties.municipalities.length).toBe(1);
  });

  test("should handle complex scenario with multiple municipalities and operator groups", () => {
    const result = getOperatorsFeatureCollection(
      mockOperatorMunicipalities,
      mockMunicipalityFeatures
    );

    // Verify the total number of features created
    // We expect features for:
    // - Operator 1
    // - Operator 2
    // - Operator 3
    // - Operator 4
    // - Operators 3 & 4 combined
    // - Operator 5
    // - Operator 6
    // - Operators 5 & 6 combined
    // - Operator 7
    // - Operator 8
    // - Operators 7 & 8 combined
    expect(result.features.length).toBeGreaterThan(0);

    // Check for municipalities served by the same operators (5 & 6)
    const sharedOperatorFeature = result.features.find(
      (f) =>
        f.properties.operators.length === 2 &&
        f.properties.operators.includes(5) &&
        f.properties.operators.includes(6)
    );

    expect(sharedOperatorFeature).toBeDefined();
    expect(sharedOperatorFeature?.properties.municipalities.length).toBe(2);

    // Verify single operator features exist
    const operator1Feature = result.features.find(
      (f) =>
        f.properties.operators.length === 1 && f.properties.operators[0] === 1
    );
    expect(operator1Feature).toBeDefined();

    // Verify individual municipalities with multiple operators
    const municipality6Feature = result.features.find(
      (f) =>
        f.properties.operators.length === 2 &&
        f.properties.operators.includes(7) &&
        f.properties.operators.includes(8)
    );
    expect(municipality6Feature).toBeDefined();
    expect(municipality6Feature?.properties.municipalities.length).toBe(1);
  });
});
