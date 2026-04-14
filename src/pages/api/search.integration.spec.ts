import { Client, fetchExchange } from "urql";
import { beforeAll, describe, expect, it } from "vitest";

import {
  CantonsDocument,
  type CantonsQuery,
  type CantonsQueryVariables,
  MunicipalitiesDocument,
  type MunicipalitiesQuery,
  type MunicipalitiesQueryVariables,
  OperatorsDocument,
  type OperatorsQuery,
  type OperatorsQueryVariables,
} from "src/graphql/queries";
import { BASE_URL } from "src/utils/base-url";
import { makeDeploymentAuthHeaders } from "src/utils/integration-headers";

const GRAPHQL_URL = `${BASE_URL}/api/graphql`;

const makeClient = () =>
  new Client({
    url: GRAPHQL_URL,
    exchanges: [fetchExchange],
    fetchOptions: { headers: makeDeploymentAuthHeaders() },
  });

beforeAll(async () => {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...makeDeploymentAuthHeaders(),
    },
    body: JSON.stringify({ query: "{ __typename }" }),
  });
  if (!res.ok) throw new Error(`GraphQL not reachable: ${await res.text()}`);
});

describe("Search - municipalities", () => {
  async function searchMunicipalities(vars: MunicipalitiesQueryVariables) {
    const result = await makeClient()
      .query<MunicipalitiesQuery, MunicipalitiesQueryVariables>(
        MunicipalitiesDocument,
        vars
      )
      .toPromise();
    return result.data?.municipalities ?? [];
  }

  it("returns results for an exact match", async () => {
    const results = await searchMunicipalities({
      locale: "de",
      query: "Zürich",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name === "Zürich")).toBe(true);
  });

  it("handles diacritics - zurich should match Zürich", async () => {
    const results = await searchMunicipalities({
      locale: "de",
      query: "zurich",
    });
    expect(results.some((r) => r.name === "Zürich")).toBe(true);
  });

  it("handles typos - zurih should match Zürich", async () => {
    const results = await searchMunicipalities({
      locale: "de",
      query: "zurih",
    });
    expect(results.some((r) => r.name === "Zürich")).toBe(true);
  });

  it("returns results with the expected shape", async () => {
    const results = await searchMunicipalities({ locale: "de", query: "Bern" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("id");
    expect(results[0]).toHaveProperty("name");
  });

  it("hydrates labels by ids (empty query)", async () => {
    // Used by MunicipalitiesCombobox to display names of already-selected items
    const results = await searchMunicipalities({
      locale: "de",
      query: "",
      ids: ["351"],
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "351", name: "Bern" });
  });

  it("finds municipality by exact zip code - 3011 returns Bern", async () => {
    const results = await searchMunicipalities({ locale: "de", query: "3011" });
    expect(results.some((r) => r.name === "Bern")).toBe(true);
  });

  it("finds municipality by exact zip code - 8001 returns Zürich", async () => {
    const results = await searchMunicipalities({ locale: "de", query: "8001" });
    expect(results.some((r) => r.name === "Zürich")).toBe(true);
  });

  it("finds municipalities by partial zip code prefix", async () => {
    // Prefix "301" should match zip codes like 3011, 3012, 3013, … all in Bern
    const results = await searchMunicipalities({ locale: "de", query: "301" });
    expect(results.some((r) => r.name === "Bern")).toBe(true);
  });
});

describe("Search - cantons", () => {
  async function searchCantons(vars: CantonsQueryVariables) {
    const result = await makeClient()
      .query<CantonsQuery, CantonsQueryVariables>(CantonsDocument, vars)
      .toPromise();
    return result.data?.cantons ?? [];
  }

  it("returns cantons for a query", async () => {
    const results = await searchCantons({ locale: "de", query: "Bern" });
    expect(results.length).toBeGreaterThan(0);
  });

  it("handles diacritics - zurich should match Zürich", async () => {
    const results = await searchCantons({ locale: "de", query: "zurich" });
    expect(results.some((r) => r.name.toLowerCase().includes("zürich"))).toBe(
      true
    );
  });

  it("hydrates labels by ids (empty query)", async () => {
    const results = await searchCantons({
      locale: "de",
      query: "",
      ids: ["2"],
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "2", name: "Bern" });
  });
});

describe("Search - operators", () => {
  async function searchOperators(vars: OperatorsQueryVariables) {
    const result = await makeClient()
      .query<OperatorsQuery, OperatorsQueryVariables>(OperatorsDocument, vars)
      .toPromise();
    return result.data?.operators ?? [];
  }

  it("returns operators for an exact match", async () => {
    const results = await searchOperators({
      locale: "de",
      query: "BKW Energie AG",
    });
    expect(results.some((r) => r.name === "BKW Energie AG")).toBe(true);
  });

  it("handles diacritics - aew should match AEW Energie AG", async () => {
    const results = await searchOperators({
      locale: "de",
      query: "aew energie",
    });
    expect(results.some((r) => r.name === "AEW Energie AG")).toBe(true);
  });

  it("handles typos - axpo gid should match Axpo Grid AG", async () => {
    const results = await searchOperators({
      locale: "de",
      query: "axpo gid",
    });
    expect(results.some((r) => r.name === "Axpo Grid AG")).toBe(true);
  });

  it("hydrates labels by ids (empty query)", async () => {
    const results = await searchOperators({
      locale: "de",
      query: "",
      ids: ["36"],
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "36", name: "BKW Energie AG" });
  });
});

describe("Search - multi-type", () => {
  it("returns mixed types when searching across all types", async () => {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...makeDeploymentAuthHeaders(),
      },
      body: JSON.stringify({
        query: `query { search(locale: "de", query: "bern") { __typename id name } }`,
      }),
    });
    const { data } = await res.json();
    const typeNames = new Set(
      (data.search as { __typename: string }[]).map((r) => r.__typename)
    );
    expect(typeNames.has("MunicipalityResult")).toBe(true);
    expect(typeNames.has("CantonResult")).toBe(true);
  });
});
