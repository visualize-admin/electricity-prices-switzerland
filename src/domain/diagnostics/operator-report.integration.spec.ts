import { describe, expect, test } from "vitest";

import {
  buildOperatorReport,
  fetchOperatorReportData,
} from "src/domain/diagnostics/operator-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";
import { BASE_URL } from "src/utils/base-url";
import { makeDeploymentAuthHeaders } from "src/utils/integration-headers";

const ENDPOINT = `${BASE_URL}/api/graphql`;

/**
 * Guards against regressions in the operator-centric view of the map's
 * operator-municipality data: hits the real GraphQL API and compares the
 * report against a saved snapshot file. Also serves as the regression guard
 * for the specific case that motivated this report — operator 565 (ewz)
 * legitimately serving Graubünden municipalities alongside Zürich ones.
 */
describe("energy prices operator report (against live GraphQL API)", () => {
  const client = createNodeGraphqlClient(ENDPOINT, makeDeploymentAuthHeaders());

  test("ewz (565), 2026: serves municipalities across Zürich and Graubünden", async () => {
    const data = await fetchOperatorReportData(client, {
      year: "2026",
      operator: "565",
      locale: "de",
    });
    const report = buildOperatorReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/operator-report/ewz-565-2026.txt"
    );
  });
});
