import { describe, expect, it } from "vitest";

import {
  sparqlClient,
  sparqlTestClient,
} from "src/rdf/common-integration-tests";
import { fetchOperatorInfo, fetchOperatorName } from "src/rdf/search-queries";

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

describe("fetchOperatorName", () => {
  it("returns the name of an operator that has no electricity price observations", async () => {
    const name = await fetchOperatorName({
      operatorId: "30",
      client: sparqlClient,
    });

    expect(name).toBe("Azienda elettrica ticinese");
  });

  it("returns undefined for an unknown operator", async () => {
    const name = await fetchOperatorName({
      operatorId: "999999",
      client: sparqlClient,
    });

    expect(name).toBeUndefined();
  });
});
