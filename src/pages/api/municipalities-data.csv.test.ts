import { csvParse } from "d3";
import { describe, expect, it, vi } from "vitest";

vi.mock("src/graphql/server-context", () => ({
  contextFromAPIRequest: vi.fn(),
}));

vi.mock("src/env/runtime", () => ({
  runtimeEnv: { CURRENT_PERIOD: "2026" },
}));

vi.mock("fs", () => ({ default: { writeFileSync: vi.fn() } }));

import { contextFromAPIRequest } from "src/graphql/server-context";
import handler from "./municipalities-data.csv";

const sparqlBinding = (value: string) => ({ value });

const makeSparqlResponse = (
  bindings: Record<string, { value: string }>[]
) => ({
  json: () =>
    Promise.resolve({
      results: { bindings },
    }),
});

const createMockReq = (query: Record<string, string> = {}) =>
  ({ query, headers: {} }) as never;

const createMockRes = () => {
  let body = "";
  return {
    setHeader: vi.fn(),
    send: vi.fn((data: string) => {
      body = data;
    }),
    getBody: () => body,
  };
};

describe("municipalities-data.csv handler", () => {
  it("includes operatorUid column populated from schema:identifier", async () => {
    vi.mocked(contextFromAPIRequest).mockResolvedValue({
      sparqlClient: {
        query: { endpoint: { endpointUrl: "https://mock-sparql" } },
      },
    } as never);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeSparqlResponse([
          {
            netzbetreiber: sparqlBinding("EWZ Zürich"),
            uid: sparqlBinding("CHE-115.194.319"),
            gemeindeName: sparqlBinding("Zürich"),
            gemeindeNummer: sparqlBinding("261"),
            netzbetreiberPlz: sparqlBinding("8050"),
            netzbetreiberOrt: sparqlBinding("Zürich"),
            netzbetreiberStrasse: sparqlBinding("Tramstrasse 35"),
            kanton: sparqlBinding("ZH"),
          },
        ])
      )
    );

    const res = createMockRes();
    await handler(createMockReq(), res as never);

    const rows = csvParse(res.getBody());
    expect(rows[0]?.operatorUid).toBe("CHE-115.194.319");
  });

  it("leaves operatorUid empty when schema:identifier is absent (OPTIONAL)", async () => {
    vi.mocked(contextFromAPIRequest).mockResolvedValue({
      sparqlClient: {
        query: { endpoint: { endpointUrl: "https://mock-sparql" } },
      },
    } as never);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeSparqlResponse([
          {
            netzbetreiber: sparqlBinding("Kleines EW"),
            // uid absent — operator has no schema:identifier
            gemeindeName: sparqlBinding("Musterdorf"),
            gemeindeNummer: sparqlBinding("9999"),
            netzbetreiberPlz: sparqlBinding("3000"),
            netzbetreiberOrt: sparqlBinding("Bern"),
            netzbetreiberStrasse: sparqlBinding("Musterstrasse 1"),
            kanton: sparqlBinding("BE"),
          },
        ])
      )
    );

    const res = createMockRes();
    await handler(createMockReq(), res as never);

    const rows = csvParse(res.getBody());
    expect(rows[0]?.operatorUid).toBe("");
  });
});
