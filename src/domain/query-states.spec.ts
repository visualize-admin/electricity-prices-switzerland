// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import buildEnv from "../../src/env/build";
import { makeLinkGenerator } from "../../src/lib/use-query-state";

import * as queryStates from "./query-states";

// Create a mock router compatible with the useRouter hook
const createMockRouter = (query = {}) => {
  return () => ({
    query,
    pathname: "/test",
    replace: vi.fn(),
    route: "",
    asPath: "",
    basePath: "",
    isLocaleDomain: false,
    isReady: true,
    push: vi.fn(),
    prefetch: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    isPreview: false,
  });
};

describe("Query States", () => {
  describe("Basic Functionality", () => {
    it("should return default values when no query params are provided", () => {
      const mockRouter = createMockRouter({});

      const { result } = renderHook(() =>
        queryStates.useQueryStateMapCommon({ router: mockRouter })
      );

      expect(result.current[0]).toEqual({
        tab: "electricity",
        activeId: null,
      });
    });

    it("should return values from query params when provided", () => {
      const mockRouter = createMockRouter({
        tab: "sunshine",
        activeId: "123",
      });

      const { result } = renderHook(() =>
        queryStates.useQueryStateMapCommon({ router: mockRouter })
      );

      expect(result.current[0]).toEqual({
        tab: "sunshine",
        activeId: "123",
      });
    });

    it("should update query params when setState is called", () => {
      const mockRouter = createMockRouter({});

      const router = mockRouter();
      const { result } = renderHook(() =>
        queryStates.useQueryStateMapCommon({ router: () => router })
      );

      act(() => {
        result.current[1]({ tab: "sunshine" });
      });

      expect(router.replace).toHaveBeenCalledWith(
        {
          pathname: "/test",
          query: { tab: "sunshine" },
        },
        undefined,
        { shallow: true }
      );
    });
  });

  describe("Energy Prices Map Schema", () => {
    it("should handle all energy prices map query params correctly", () => {
      const mockRouter = createMockRouter({
        tab: "electricity",
        period: "2024",
        category: "H7",
        priceComponent: "energy",
        product: "premium",
      });

      const { result } = renderHook(() =>
        queryStates.useQueryStateEnergyPricesMap({ router: mockRouter })
      );

      expect(result.current[0]).toEqual({
        tab: "electricity",
        period: "2024",
        category: "H7",
        priceComponent: "energy",
        product: "premium",
        cantonsOrder: "median-asc",
        view: "collapsed",
      });
    });
  });

  describe("Energy Prices Details Schema", () => {
    it("should handle array query params correctly with the updated schema", () => {
      // This test case mimics how URL query params would actually be structured
      // In a real URL query, arrays would typically be comma-separated strings
      const mockRouter = createMockRouter({
        category: "H4,H7,C6",
        period: "2024,2023",
        priceComponent: "total,energy",
        canton: "ZH,BE",
      });

      const { result } = renderHook(() =>
        queryStates.useQueryStateEnergyPricesDetails({ router: mockRouter })
      );

      // With the updated schema using stringToArray, these should now be arrays
      expect(result.current[0].category).toEqual(["H4", "H7", "C6"]);
      expect(result.current[0].period).toEqual(["2024", "2023"]);
      expect(result.current[0].priceComponent).toEqual(["total", "energy"]);
      expect(result.current[0].canton).toEqual(["ZH", "BE"]);
    });

    it("should use default values for energy prices details", () => {
      const mockRouter = createMockRouter({});

      const { result } = renderHook(() =>
        queryStates.useQueryStateEnergyPricesDetails({ router: mockRouter })
      );

      // Default values should be properly initialized as arrays
      expect(result.current[0]).toEqual({
        period: [buildEnv.CURRENT_PERIOD],
        municipality: [],
        canton: [],
        category: ["H4"],
        priceComponent: ["total"],
        product: ["standard"],
        cantonsOrder: ["median-asc"],
        view: ["collapsed"],
      });
    });
  });

  describe("Sunshine Map Schema", () => {
    it("should handle sunshine map query params correctly", () => {
      const mockRouter = createMockRouter({
        tab: "sunshine",
        period: "2023",
        indicator: "saifi",
        activeId: "abc123",
      });

      const { result } = renderHook(() =>
        queryStates.useQueryStateSunshineMap({ router: mockRouter })
      );

      expect(result.current[0]).toEqual({
        tab: "sunshine",
        period: "2023",
        peerGroup: "all_grid_operators",
        typology: "total",
        indicator: "saifi",
        category: "C2",
        networkLevel: "NE5",
        activeId: "abc123",
      });
    });
  });

  describe("Sunshine Details Schema", () => {
    it("should handle tab parameter correctly", () => {
      const mockRouter = createMockRouter({
        tab: "saidi",
      });

      const { result } = renderHook(() =>
        queryStates.useQueryStateSunshineDetails({ router: mockRouter })
      );

      expect(result.current[0]).toEqual({
        tab: "saidi",
      });
    });
  });

  describe("Link Generator", () => {
    it("should generate correct link with query params", () => {
      const link = queryStates.sunshineDetailsLink("/details", {
        tab: "saidi",
      });
      expect(link).toBe("/details?tab=saidi");
    });

    it("should correctly convert arrays to comma-separated strings in URLs", () => {
      // Create test schema and link generator
      const testStringToArray = (defaultValue: string[] = []) =>
        z
          .string()
          .default(defaultValue.join(","))
          .transform((x) => (x ? x.split(",").filter(Boolean) : defaultValue));

      const testSchema = z.object({
        items: testStringToArray(["default"]),
        singleValue: z.string().default("default"),
      });

      const testLinkGenerator = makeLinkGenerator(testSchema);

      // Test with array values
      const link = testLinkGenerator("/test", {
        items: ["item1", "item2", "item3"],
        singleValue: "value",
      });

      expect(link).toBe("/test?items=item1%2Citem2%2Citem3&singleValue=value");
    });
  });

  describe("defaultValue option", () => {
    it("should use the custom defaultValue when no query params are present", () => {
      const mockRouter = createMockRouter({});
      const customDefault = { tab: "sunshine" as const, activeId: "custom" };
      const { result } = renderHook(() =>
        queryStates.useQueryStateMapCommon({
          router: mockRouter,
          defaultValue: customDefault,
        })
      );
      expect(result.current[0]).toEqual(customDefault);
    });

    it("should let query params override the custom defaultValue", () => {
      const mockRouter = createMockRouter({
        tab: "electricity",
        activeId: "fromQuery",
      });
      const customDefault = { tab: "sunshine" as const, activeId: "custom" };
      const { result } = renderHook(() =>
        queryStates.useQueryStateMapCommon({
          router: mockRouter,
          defaultValue: customDefault,
        })
      );
      expect(result.current[0]).toEqual({
        tab: "electricity",
        activeId: "fromQuery",
      });
    });
  });
});
