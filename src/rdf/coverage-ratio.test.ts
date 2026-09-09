import { describe, expect, it } from "vitest";

import {
  coverageOfferYear,
  FALLBACK_OFFERS_YEAR,
} from "src/rdf/coverage-ratio";

describe("coverageOfferYear", () => {
  it("maps years before offers existed to FALLBACK_OFFERS_YEAR", () => {
    expect(coverageOfferYear("2011")).toBe(FALLBACK_OFFERS_YEAR);
    expect(coverageOfferYear("2024")).toBe(FALLBACK_OFFERS_YEAR);
  });

  it("keeps 2025+ so we still probe years that may have their own offers", () => {
    expect(coverageOfferYear("2025")).toBe("2025");
    expect(coverageOfferYear("2026")).toBe("2026");
    expect(coverageOfferYear("2027")).toBe("2027");
  });

  it("collapses a full tariff history to one SPARQL year plus current", () => {
    const history = Array.from({ length: 17 }, (_, i) => String(2011 + i));
    const queried = [...new Set(history.map(coverageOfferYear))];
    expect(queried).toEqual(["2025", "2026", "2027"]);
  });
});
