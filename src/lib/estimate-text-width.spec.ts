import { describe, expect, it } from "vitest";

import { estimateTextWidth, wrapText } from "./estimate-text-width";

describe("wrapText", () => {
  it("keeps a short string on one line", () => {
    expect(wrapText("1.63 ct./kWh 2026", 400, 12)).toEqual([
      "1.63 ct./kWh 2026",
    ]);
  });

  it("wraps at word boundaries before maxWidth", () => {
    const text =
      "1.63 ct./kWh 2026, Società Elettrica Sopracenerina SA (Ticino)";
    const maxWidth = 280;
    const lines = wrapText(text, maxWidth, 12);

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(" ")).toBe(text);
    for (const line of lines) {
      expect(estimateTextWidth(line, 12)).toBeLessThanOrEqual(maxWidth);
    }
  });
});
