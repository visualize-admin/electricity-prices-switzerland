import * as fs from "fs";
import * as path from "path";

import { get, isEqual, omit, sortBy } from "lodash";
import { describe, it, expect } from "vitest";

import { ResolvedObservation } from "src/graphql/resolver-mapped-types";

// Change this if needed
const EXPECT_FOLDER = process.env.EXPECT_FOLDER || `/tmp/lindas-prod`;
const ACTUAL_FOLDER = process.env.ACTUAL_FOLDER || `/tmp/lindas-cognizone`;

/**
 * Formats a request/response filename based on operation name and variables
 * @param x The request/response object
 * @returns Formatted filename string
 */
const requestResponseFilenameFormatter = (x: unknown): string => {
  if (!x || typeof x !== "object") return "unknown";

  const obj = x as $IntentionalAny;
  const operationName = obj.operationName || "unknown";
  const variables = obj.request?.variables || {};

  const variableParts: string[] = [];

  Object.entries(variables).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      Object.entries(value as object).forEach(([subKey, subValue]) => {
        if (Array.isArray(subValue)) {
          variableParts.push(`${key}.${subKey}=${subValue.join(",")}`);
        } else {
          variableParts.push(`${key}.${subKey}=${subValue}`);
        }
      });
    } else {
      variableParts.push(`${key}=${value}`);
    }
  });

  return `${operationName}${
    variableParts.length > 0 ? "(" + variableParts.join(", ") + ")" : ""
  }`;
};

describe("GraphQL Requests/Responses", () => {
  if (!fs.existsSync(EXPECT_FOLDER) || !fs.existsSync(ACTUAL_FOLDER)) {
    it.skip("Expected or Actual folder does not exist, skipping tests", () => {});
    return;
  }

  // Get all files from the expected directory
  const expectedFiles = fs
    .readdirSync(EXPECT_FOLDER)
    .filter((file) => file.endsWith(".json"))
    .filter(
      (file) =>
        !file.includes("-Introspection-") && !file.includes("-WikiContent-")
    ); // Skip introspection queries

  // Test each file
  for (const fileName of expectedFiles) {
    const expectedPath = path.join(EXPECT_FOLDER, fileName);
    const actualPath = path.join(ACTUAL_FOLDER, fileName);
    // Load and parse both JSON files
    const expectedContent = omit(
      JSON.parse(fs.readFileSync(expectedPath, "utf8")),
      ["timestamp"]
    );

    it(`should match expected response for ${fileName} ${requestResponseFilenameFormatter(
      expectedContent
    )}`, () => {
      const actualContent = omit(
        JSON.parse(fs.readFileSync(actualPath, "utf8")),
        ["timestamp"]
      );
      // Check if the actual file exists
      expect(
        fs.existsSync(actualPath),
        `File ${fileName} should exist in actual folder`
      ).toBe(true);

      const { modifiedActual, modifiedExpected } = (() => {
        if (fileName.includes("-Observations-")) {
          const sorters: Array<
            (x: ResolvedObservation) => string | number | undefined
          > = [
            (x) => x.period,
            (x) => x.municipality,
            (x) => x.operator,
            (x) => x.value,
          ];
          const modifiedActual = sortBy(
            get(actualContent, "response.data.observations"),
            ...sorters
          );
          const modifiedExpected = sortBy(
            get(expectedContent, "response.data.observations"),
            ...sorters
          );
          return { modifiedActual, modifiedExpected };
        }
        return {
          modifiedActual: actualContent,
          modifiedExpected: expectedContent,
        };
      })();

      // Compare the contents
      try {
        const equal = isEqual(modifiedActual, modifiedExpected);
        // const formatObservation = (obs: ResolvedObservation) => {
        //   return `${obs.period} - ${obs.municipality} - ${
        //     obs.municipalityLabel
        //   } - ${obs.value} - ${JSON.stringify(obs)}`;
        // };
        // console.log(
        //   modifiedActual.slice(0, 100).map(formatObservation),
        //   modifiedExpected.slice(0, 100).map(formatObservation)
        // );
        expect(equal, `Contents of ${fileName} do not match`).toBe(true);
      } catch (error) {
        console.error(
          `Mismatch found in file ${fileName} (${requestResponseFilenameFormatter(
            expectedContent
          )})`
        );
        throw error;
      }
    });
  }

  it("should have the same files in both directories", () => {
    const expectedFiles = fs
      .readdirSync(EXPECT_FOLDER)
      .filter((file) => file.endsWith(".json"));

    const actualFiles = fs
      .readdirSync(ACTUAL_FOLDER)
      .filter((file) => file.endsWith(".json"));

    expect(actualFiles).toEqual(expectedFiles);
  });
});
