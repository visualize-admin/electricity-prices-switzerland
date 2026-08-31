import { describe, expect, test } from "vitest";

import {
  buildOperatorAnomaliesReport,
  fetchOperatorAnomaliesReportData,
} from "src/domain/diagnostics/operator-anomalies-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";
import { BASE_URL } from "src/utils/base-url";
import { makeDeploymentAuthHeaders } from "src/utils/integration-headers";

const ENDPOINT = `${BASE_URL}/api/graphql`;

/**
 * Guards against regressions in the cross-canton anomaly scan: hits the real
 * GraphQL API and compares the report against a saved snapshot file. This is
 * the regression guard that operator 565 (ewz) serving a minority of
 * Graubünden municipalities alongside its Zürich ones stays discoverable in
 * one command going forward.
 */
describe("operator anomalies scan (against live GraphQL API)", () => {
  const client = createNodeGraphqlClient(ENDPOINT, makeDeploymentAuthHeaders());

  test("2026: flags ewz (565) for its Graubünden minority", async () => {
    const data = await fetchOperatorAnomaliesReportData(client, {
      year: "2026",
      locale: "de",
    });
    const report = buildOperatorAnomaliesReport(data);
    expect(report).toContain("Elektrizitätswerk der Stadt Zürich (565)");
    expect(report).toContain("Graubünden");
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/operator-anomalies-report/2026.txt"
    );
  });
});
