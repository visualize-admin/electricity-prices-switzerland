import { afterEach, describe, expect, it } from "vitest";

import {
  clearCsvExportCache,
  getOrComputeCsv,
  peekCsvExport,
} from "src/lib/csv-export";
import { clearProcessCache, listProcessCaches } from "src/lib/process-caches";

afterEach(() => {
  clearCsvExportCache();
});

describe("process caches", () => {
  it("lists csv-export among registered caches", () => {
    expect(listProcessCaches().map((cache) => cache.id)).toContain(
      "csv-export"
    );
  });

  it("clears the csv-export cache without a restart", async () => {
    await getOrComputeCsv("admin-clear", async () => "csv");
    expect(peekCsvExport("admin-clear")).toBeTruthy();

    clearProcessCache("csv-export");

    expect(peekCsvExport("admin-clear")).toBeNull();
    expect(
      listProcessCaches().find((cache) => cache.id === "csv-export")?.size
    ).toBe(0);
  });
});
