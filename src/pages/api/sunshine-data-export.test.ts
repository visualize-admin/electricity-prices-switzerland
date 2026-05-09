import { csvParse } from "d3";
import { describe, expect, it, vi } from "vitest";

// @lingui/macro requires Babel transform; mock it to return message defaults
vi.mock("@lingui/macro", () => ({
  t: ({ message }: { message: string }) => message,
  defineMessage: (d: object) => d,
}));

vi.mock("src/graphql/server-context", () => ({
  contextFromAPIRequest: vi.fn(),
}));

vi.mock("src/env/runtime", () => ({
  runtimeEnv: { CURRENT_PERIOD: "2025" },
}));

import { contextFromAPIRequest } from "src/graphql/server-context";
import { createSunshineDataService } from "src/rdf/sunshine";

import handler from "./sunshine-data-export";

const sparqlValue = (v: string) => ({ value: v });
const sparqlUndefined = () => ({
  datatype: { value: "https://cube.link/Undefined" },
});

const YES_IRI = "https://energy.ld.admin.ch/elcom/electricityprice/Yes";
const NO_IRI = "https://energy.ld.admin.ch/elcom/electricityprice/No";

async function* asyncRows<T>(rows: T[]) {
  for (const row of rows) {
    yield row;
  }
}

const createMockClient = (
  mainRows: Record<string, unknown>[],
  tariffRows: Record<string, unknown>[] = []
) =>
  ({
    query: {
      select: vi
        .fn()
        .mockResolvedValueOnce(asyncRows(mainRows))
        .mockResolvedValueOnce(asyncRows(tariffRows)),
    },
  }) as never;

const createMockReq = (query: Record<string, string> = {}) =>
  ({ query: { locale: "de", period: "2025", ...query }, headers: {} }) as never;

const createMockRes = () => {
  let body = "";
  return {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn((data: string) => {
      body = data;
    }),
    getBody: () => body,
  };
};

const makeMainRow = (
  id: number,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  operator: sparqlValue(
    `https://energy.ld.admin.ch/elcom/sunshine/operator/${id}`
  ),
  operator_name: sparqlValue(`Operator ${id}`),
  period: sparqlValue("2025"),
  gridcost_ne5: sparqlValue("0"),
  gridcost_ne6: sparqlValue("0"),
  gridcost_ne7: sparqlValue("0"),
  franken_regel: sparqlValue("0"),
  info: sparqlUndefined(),
  days_in_advance: sparqlUndefined(),
  in_time: sparqlUndefined(),
  saidi_total: sparqlValue("0"),
  saidi_unplanned: sparqlValue("0"),
  saifi_total: sparqlValue("0"),
  saifi_unplanned: sparqlValue("0"),
  ...overrides,
});

describe("sunshine-data-export handler", () => {
  it("renders infoYesNo and timely as Ja/Nein/empty — never raw boolean or false", async () => {
    const client = createMockClient([
      makeMainRow(1, {
        operator_name: sparqlValue("Operator Yes"),
        info: sparqlValue(YES_IRI),
        in_time: sparqlValue(YES_IRI),
        days_in_advance: sparqlValue("7"),
      }),
      makeMainRow(2, {
        operator_name: sparqlValue("Operator No"),
        info: sparqlValue(NO_IRI),
        in_time: sparqlValue(NO_IRI),
        // days_in_advance absent → should be empty, not NaN
      }),
      makeMainRow(3, {
        operator_name: sparqlValue("Operator Null"),
        // all boolean fields undefined → should be empty
      }),
    ]);

    vi.mocked(contextFromAPIRequest).mockResolvedValue({
      sunshineDataService: createSunshineDataService(client),
    } as never);

    const res = createMockRes();
    await handler(createMockReq(), res as never);

    const rows = csvParse(res.getBody());
    const yes = rows.find((r) => r["Operator Name"] === "Operator Yes")!;
    const no = rows.find((r) => r["Operator Name"] === "Operator No")!;
    const nil = rows.find((r) => r["Operator Name"] === "Operator Null")!;

    // infoYesNo: was confusing null with false before fix
    expect(yes["Customer Outage Notification"]).toBe("Ja");
    expect(no["Customer Outage Notification"]).toBe("Nein");
    expect(nil["Customer Outage Notification"]).toBe("");

    // timely: was always "false" before fix (in_time is an IRI, not "true"/"false")
    expect(yes["Timely Paper Submission"]).toBe("Ja");
    expect(no["Timely Paper Submission"]).toBe("Nein");
    expect(nil["Timely Paper Submission"]).toBe("");

    // infoDaysInAdvance: was NaN before fix
    const daysCol = Object.keys(rows.columns).find((k) =>
      k.startsWith("Days in Advance")
    ) ?? "Days in Advance for Notification (Tage)";
    expect(yes[daysCol]).toBe("7");
    expect(no[daysCol]).toBe("");
    expect(nil[daysCol]).toBe("");
  });

  it("uses schema:identifier as operatorUID and falls back to partner ID when absent", async () => {
    const client = createMockClient([
      makeMainRow(42, {
        operator_name: sparqlValue("With UID"),
        operator_uid: sparqlValue("CHE-042.042.042"),
      }),
      makeMainRow(99, {
        operator_name: sparqlValue("Without UID"),
        // operator_uid absent (OPTIONAL in SPARQL)
      }),
    ]);

    vi.mocked(contextFromAPIRequest).mockResolvedValue({
      sunshineDataService: createSunshineDataService(client),
    } as never);

    const res = createMockRes();
    await handler(createMockReq(), res as never);

    const rows = csvParse(res.getBody());

    expect(rows.find((r) => r["Operator Name"] === "With UID")?.["Operator UID"]).toBe(
      "CHE-042.042.042"
    );
    expect(rows.find((r) => r["Operator Name"] === "Without UID")?.["Operator UID"]).toBe(
      "99"
    );
  });

  it("sorts rows numerically by operator ID, not lexicographically", async () => {
    // SPARQL returns in URI/lexicographic order: 10 < 2 < 9 lexicographically
    const client = createMockClient([makeMainRow(10), makeMainRow(2), makeMainRow(9)]);

    vi.mocked(contextFromAPIRequest).mockResolvedValue({
      sunshineDataService: createSunshineDataService(client),
    } as never);

    const res = createMockRes();
    await handler(createMockReq(), res as never);

    const ids = csvParse(res.getBody()).map((r) => r["Operator ID"]);
    expect(ids).toEqual(["2", "9", "10"]);
  });
});
