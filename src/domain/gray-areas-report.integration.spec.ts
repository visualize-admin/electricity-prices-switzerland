import { describe, expect, test } from "vitest";

import {
  buildGrayAreasReport,
  fetchGrayAreasReportData,
} from "src/domain/gray-areas-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";
import { BASE_URL } from "src/utils/base-url";
import { makeDeploymentAuthHeaders } from "src/utils/integration-headers";

const ENDPOINT = `${BASE_URL}/api/graphql`;

const BASE_ARGS = {
  category: "H4",
  priceComponent: "total",
  product: "standard",
  locale: "de",
};

/**
 * Guards against regressions in which municipalities the map renders without
 * a color ("gray"): hits the real GraphQL API (same documents and
 * computation as the energy-prices CLI's gray-area scan) and compares the
 * report against a saved snapshot file.
 */
describe("energy prices gray-area scan (against live GraphQL API)", () => {
  const client = createNodeGraphqlClient(ENDPOINT, makeDeploymentAuthHeaders());

  test("operator entity, 2025: Augst is gray (its only operator has no observation)", async () => {
    const data = await fetchGrayAreasReportData(client, {
      ...BASE_ARGS,
      year: "2025",
      entity: "operator",
    });
    const report = buildGrayAreasReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/gray-areas-report/operator-2025.txt"
    );
  });
});
