import { describe, expect, test } from "vitest";

import {
  buildSunshineReport,
  fetchSunshineReportData,
} from "src/domain/diagnostics/sunshine-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";
import { BASE_URL } from "src/utils/base-url";
import { makeDeploymentAuthHeaders } from "src/utils/integration-headers";

const ENDPOINT = `${BASE_URL}/api/graphql`;

/**
 * Guards against regressions in the sunshine CLI's operator report: hits the
 * real GraphQL API (same `sunshineDataByIndicator` document the sunshine map
 * uses) and compares the report against a saved snapshot file.
 */
describe("sunshine operator report (against live GraphQL API)", () => {
  const client = createNodeGraphqlClient(ENDPOINT, makeDeploymentAuthHeaders());

  test("ewz (565), networkCosts, 2026: reports value and median", async () => {
    const data = await fetchSunshineReportData(client, {
      year: "2026",
      indicator: "networkCosts",
      operator: "565",
      networkLevel: "NE7",
      locale: "de",
    });
    const report = buildSunshineReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/sunshine-report/ewz-565-networkcosts-2026.txt"
    );
  });

  test("ewz (565), saidi, 2026: reports value and median", async () => {
    const data = await fetchSunshineReportData(client, {
      year: "2026",
      indicator: "saidi",
      operator: "565",
      locale: "de",
    });
    const report = buildSunshineReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/sunshine-report/ewz-565-saidi-2026.txt"
    );
  });
});
