import { describe, expect, it } from "vitest";

import { inferReportFromMapUrl } from "src/domain/diagnostics/map-url-diagnosis";
import { runtimeEnv } from "src/env/runtime";

const CURRENT_PERIOD = runtimeEnv.CURRENT_PERIOD;
const SUNSHINE_CURRENT_PERIOD = runtimeEnv.SUNSHINE_CURRENT_PERIOD;

describe("inferReportFromMapUrl", () => {
  it("sunshine tab + activeId, no indicator -> operator report (the original ewz/Graubünden case)", () => {
    expect(
      inferReportFromMapUrl(
        "https://www.strompreis.abn.elcom.admin.ch/map?period=2026&tab=sunshine&activeId=565"
      )
    ).toEqual({
      reportId: "operator",
      values: { operator: "565", year: "2026" },
    });
  });

  it("sunshine tab + activeId + explicit indicator -> sunshine report", () => {
    expect(
      inferReportFromMapUrl(
        "?tab=sunshine&activeId=635&indicator=saidi&period=2025"
      )
    ).toEqual({
      reportId: "sunshine",
      values: {
        operator: "635",
        year: "2025",
        indicator: "saidi",
        networkLevel: "NE7",
      },
    });
  });

  it("sunshine tab, no activeId -> sunshine report, operator left blank", () => {
    expect(inferReportFromMapUrl("?category=H4&tab=sunshine")).toEqual({
      reportId: "sunshine",
      values: {
        year: SUNSHINE_CURRENT_PERIOD,
        indicator: "networkCosts",
        networkLevel: "NE7",
      },
    });
  });

  it("electricity tab, no activeId -> gray-areas report, entity municipality by default", () => {
    expect(inferReportFromMapUrl("?category=H4&tab=electricity")).toEqual({
      reportId: "gray-areas",
      values: {
        year: CURRENT_PERIOD,
        category: "H4",
        priceComponent: "total",
        product: "standard",
        entity: "municipality",
      },
    });
  });

  it("electricity tab + priceComponent, no activeId -> gray-areas report with that priceComponent", () => {
    expect(
      inferReportFromMapUrl(
        "?category=H4&tab=electricity&priceComponent=annualmeteringcost"
      )
    ).toEqual({
      reportId: "gray-areas",
      values: {
        year: CURRENT_PERIOD,
        category: "H4",
        priceComponent: "annualmeteringcost",
        product: "standard",
        entity: "municipality",
      },
    });
  });

  it("electricity tab + entity=operator, no activeId -> gray-areas report, entity operator", () => {
    expect(
      inferReportFromMapUrl(
        "?category=H8&tab=electricity&priceComponent=gridusage&entity=operator"
      )
    ).toEqual({
      reportId: "gray-areas",
      values: {
        year: CURRENT_PERIOD,
        category: "H8",
        priceComponent: "gridusage",
        product: "standard",
        entity: "operator",
      },
    });
  });

  it("electricity tab + activeId + entity=operator -> operator report", () => {
    expect(
      inferReportFromMapUrl(
        "?tab=electricity&activeId=486&entity=operator&period=2025"
      )
    ).toEqual({
      reportId: "operator",
      values: { operator: "486", year: "2025" },
    });
  });

  it("electricity tab + activeId + entity=canton -> canton report", () => {
    expect(
      inferReportFromMapUrl(
        "?tab=electricity&activeId=18&entity=canton&period=2025&category=H8"
      )
    ).toEqual({
      reportId: "canton",
      values: {
        canton: "18",
        year: "2025",
        category: "H8",
        priceComponent: "total",
        product: "standard",
      },
    });
  });

  it("electricity tab + activeId, no entity -> municipality report", () => {
    expect(
      inferReportFromMapUrl("?tab=electricity&activeId=261&period=2025")
    ).toEqual({
      reportId: "municipality",
      values: {
        municipality: "261",
        year: "2025",
        category: "H4",
        priceComponent: "total",
        product: "standard",
      },
    });
  });

  it("unrelated URL with none of the map's params -> null", () => {
    expect(inferReportFromMapUrl("https://example.com/?foo=bar")).toBeNull();
  });
});
