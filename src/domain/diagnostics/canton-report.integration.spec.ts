import { describe, expect, test } from "vitest";

import {
  buildCantonReport,
  fetchCantonReportData,
} from "src/domain/diagnostics/canton-report";
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
 * Guards against regressions in the canton-scoped view of the energy prices
 * map: hits the real GraphQL API and compares the report against a saved
 * snapshot file.
 */
describe("energy prices canton report (against live GraphQL API)", () => {
  const client = createNodeGraphqlClient(ENDPOINT, makeDeploymentAuthHeaders());

  test("Graubünden, 2026: lists every municipality's operator and color", async () => {
    const data = await fetchCantonReportData(client, {
      ...BASE_ARGS,
      year: "2026",
      canton: "Graubünden",
    });
    const report = buildCantonReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/canton-report/graubuenden-2026.txt"
    );
  });
});
