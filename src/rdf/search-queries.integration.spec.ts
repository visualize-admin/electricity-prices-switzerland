import { describe, expect, it } from "vitest";

import {
  sparqlClient,
  sparqlTestClient,
} from "src/rdf/common-integration-tests";
import { fetchOperatorInfo } from "src/rdf/search-queries";

describe("fetchOperatorInfo", () => {
  it("returns uid for an operator", async () => {
    const result = await fetchOperatorInfo({
      operatorId: "218",
      client: sparqlClient,
    });

    expect(result.data.uid).toBeDefined();
  });

  it("returns referenceId (NBReferenzID) when present", async () => {
    const result = await fetchOperatorInfo({
      operatorId: "2",
      client: sparqlTestClient,
    });

    expect(result.data.referenceId).toBe(
      "CB0AB0BA-E129-4320-8533-9E3609CB4CF6"
    );
  });
});
