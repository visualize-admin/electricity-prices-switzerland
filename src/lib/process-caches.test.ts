import { afterEach, describe, expect, it } from "vitest";

import { csvExportCache, getOrComputeCsv } from "src/lib/csv-export";
import { clearProcessCache, listProcessCaches } from "src/lib/process-caches";

afterEach(async () => {
  await csvExportCache.clear();
});

describe("process caches", () => {
  it("clears the csv-export cache without a restart", async () => {
    await getOrComputeCsv("admin-clear", async () => "csv");
    expect(await csvExportCache.get("admin-clear")).toBe("csv");

    await clearProcessCache("csv-export");

    expect(await csvExportCache.get("admin-clear")).toBeUndefined();
    const { sharedCaches } = await listProcessCaches();
    expect(
      sharedCaches.find((cache) => cache.namespace === "csv-export")?.size
    ).toBe(0);
  });
});
