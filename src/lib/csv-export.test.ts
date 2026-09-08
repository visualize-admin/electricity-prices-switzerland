import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearCsvExportCache,
  getOrComputeCsv,
  peekCsvExport,
} from "./csv-export";

afterEach(() => {
  clearCsvExportCache();
});

describe("getOrComputeCsv", () => {
  it("computes once when two callers miss together", async () => {
    const compute = vi.fn(async () => {
      await Promise.resolve();
      return "computed";
    });

    const [first, second] = await Promise.all([
      getOrComputeCsv("shared", compute),
      getOrComputeCsv("shared", compute),
    ]);

    expect(compute).toHaveBeenCalledTimes(1);
    expect(first).toBe("computed");
    expect(second).toBe("computed");
    expect(peekCsvExport("shared")).toBeTruthy();
  });

  it("evicts a failed compute so the next call retries", async () => {
    await expect(
      getOrComputeCsv("fail", async () => {
        throw new Error("sparql down");
      })
    ).rejects.toThrow("sparql down");

    expect(peekCsvExport("fail")).toBeNull();

    await expect(getOrComputeCsv("fail", async () => "ok")).resolves.toBe("ok");
  });
});
