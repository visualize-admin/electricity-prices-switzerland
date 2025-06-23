import * as fs from "fs";
import * as path from "path";

import { omit } from "lodash";
import { describe, it, expect } from "vitest";

const EXPECT_FOLDER = `/tmp/lindas`;
const ACTUAL_FOLDER = `/tmp/cognizone`;

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
  // Get all files from the expected directory
  const expectedFiles = fs
    .readdirSync(EXPECT_FOLDER)
    .filter((file) => file.endsWith(".json"));

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

      // Compare the contents
      expect(actualContent).toEqual(expectedContent);
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
