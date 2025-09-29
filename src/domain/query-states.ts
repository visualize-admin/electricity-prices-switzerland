import * as z from "zod";

import { runtimeEnv } from "src/env/runtime";
import {
  makeLinkGenerator,
  makeUseQueryState,
  UseQueryStateSingle,
} from "src/lib/use-query-state";

import {
  allPriceComponents,
  categories,
  detailsPriceComponents,
  periods,
  products,
} from "./data";
import { SunshineIndicator, sunshineIndicatorSchema } from "./sunshine";

/**
 * Helper function to convert comma-separated query parameter strings to arrays
 * This is necessary because URL query parameters don't naturally encode arrays
 */
const stringToArray = (defaultValue: string[] = []) => {
  return z
    .string()
    .transform((x) => {
      return x ? x.split(",").filter(Boolean) : defaultValue;
    })
    .default(defaultValue.join(","));
};

/**
 * Helper function to validate and convert query parameter strings to arrays
 * @returns Zod schema that transforms comma-separated strings to validated arrays
 */
const stringToValidatedArray = <T extends readonly string[]>(
  validOptions: T,
  defaultValue: T[number][] = []
) => {
  return z
    .string()
    .transform((x) => {
      const values = x ? x.split(",").filter(Boolean) : defaultValue;
      // Filter to only valid options, fallback to default if none are valid
      const validValues = values.filter((v) =>
        validOptions.includes(v as T[number])
      );
      return validValues.length > 0 ? validValues : defaultValue;
    })
    .default(defaultValue.join(","));
};

const mapTabsSchema = z.enum(["electricity", "sunshine"] as const);

const mapCommonSchema = z.object({
  tab: mapTabsSchema.default("electricity"),
  activeId: z.string().nullable().default(null),
});

const periodSchema = z
  .enum(periods as [string, ...string[]])
  .default(runtimeEnv.CURRENT_PERIOD);

const energyPricesMapSchema = z.object({
  tab: mapTabsSchema.default("electricity"),
  operator: z.string().optional(),
  period: periodSchema,
  municipality: z.string().optional(),
  canton: z.string().optional(),
  category: z.enum(categories).default("H4"),
  priceComponent: z.enum(allPriceComponents).default("total"),
  product: z.enum(products as [string, ...string[]]).default("standard"),
  download: z.string().optional(),
  cantonsOrder: z.string().default("median-asc"),
  view: z.string().default("collapsed"),
});
const energyPricesDetailsSchema = z.object({
  operator: stringToArray().optional(),
  period: stringToValidatedArray(periods, [runtimeEnv.CURRENT_PERIOD]),
  municipality: stringToArray([]),
  canton: stringToArray([]),
  category: stringToValidatedArray(categories, ["H4"]),
  priceComponent: stringToValidatedArray(detailsPriceComponents, ["total"]),
  product: stringToValidatedArray(products, ["standard"]),
  cantonsOrder: stringToArray(["median-asc"]),
  download: z.string().optional(),
  view: stringToArray(["collapsed"]),
});

// TODO: Sunshine params are currently not validated
const sunshineMapSchema = z.object({
  tab: mapTabsSchema.default("sunshine"),
  period: periodSchema,
  peerGroup: z.string().default("all_grid_operators"),
  saidiSaifiType: z.enum(["total", "planned", "unplanned"]).default("total"),
  complianceType: z.enum(["franc-rule"]).default("franc-rule"),
  indicator: sunshineIndicatorSchema.default("networkCosts"),
  category: z.string().default("H4"),
  networkLevel: z.string().default("NE7"),
  activeId: z.string().optional().nullable(),
});

export const sunshineMapLink = makeLinkGenerator(sunshineMapSchema);

const detailTabsSchema = z.union([sunshineIndicatorSchema, z.undefined()]); // TODO Add Operational Standards page

export type QueryStateSunshineSaidiSaifiType =
  QueryStateSunshineMap["saidiSaifiType"];

export type QueryStateSunshineComplianceType =
  QueryStateSunshineMap["complianceType"];

export const getSunshineDetailsPageFromIndicator = (
  indicator: SunshineIndicator
) => {
  if (indicator === "saidi" || indicator === "saifi") {
    return "power-stability";
  } else if (
    indicator === "networkCosts" ||
    indicator === "netTariffs" ||
    indicator === "energyTariffs"
  ) {
    return "costs-and-tariffs";
  } else {
    return "operational-standards";
  }
};
const sunshineDetailsSchema = z.object({
  tab: detailTabsSchema,
});

export const energyPricesDetailsLink = makeLinkGenerator(
  energyPricesDetailsSchema,
  "main-content"
);
export const sunshineDetailsLink = makeLinkGenerator(
  sunshineDetailsSchema,
  "main-content"
);

const sunshineOverviewFiltersSchema = z.object({
  year: z.string().default(runtimeEnv.CURRENT_PERIOD),
  category: z.string().default("C2"),
  networkLevel: z.enum(["NE5", "NE6", "NE7"]).default("NE5"),
});

// Map pages
export const useQueryStateMapCommon = makeUseQueryState(mapCommonSchema);
export const useQueryStateEnergyPricesMap = makeUseQueryState(
  energyPricesMapSchema
);
export const useQueryStateSunshineMap = makeUseQueryState(sunshineMapSchema);

// Details pages
export const useQueryStateEnergyPricesDetails = makeUseQueryState(
  energyPricesDetailsSchema
);
export const useQueryStateSunshineDetails = makeUseQueryState(
  sunshineDetailsSchema
);
export const useQueryStateSunshineOverviewFilters = makeUseQueryState(
  sunshineOverviewFiltersSchema
);

export type QueryStateEnergyPricesMap = UseQueryStateSingle<
  typeof energyPricesMapSchema.shape
>;

type QueryStateSunshineMap = UseQueryStateSingle<
  typeof sunshineMapSchema.shape
>;

export type QueryStateSingleSunshineDetails = UseQueryStateSingle<
  typeof sunshineDetailsSchema.shape
>;

const viewByFilterSchema = z.enum(["latest", "progress"]);
const compareWithFilterSchema = z
  .union([
    z.string().transform((x) => (x ? x.split(",").filter(Boolean) : [])),
    z.array(z.string()),
  ])
  .transform((x) => (Array.isArray(x) ? x : []));
const durationFilterSchema = z.enum(["total", "planned", "unplanned"]);
const overallOrRatioFilterSchema = z.enum(["overall", "ratio"]);
const powerStabilityCardFiltersSchema = z.object({
  compareWith: compareWithFilterSchema.default(["sunshine.select-all"]),
  viewBy: viewByFilterSchema.default("latest"),
  duration: durationFilterSchema.default("total"),
  overallOrRatio: overallOrRatioFilterSchema.default("overall"),
});
export const useQueryStatePowerStabilityCardFilters = makeUseQueryState(
  powerStabilityCardFiltersSchema
);
const networkCostsTrendCardFiltersSchema = z.object({
  compareWith: compareWithFilterSchema.default(["sunshine.select-all"]),
  viewBy: viewByFilterSchema.default("latest"),
});
export const useQueryStateNetworkCostsTrendCardFilters = makeUseQueryState(
  networkCostsTrendCardFiltersSchema
);
const tariffsTrendCardFiltersSchema = z.object({
  compareWith: compareWithFilterSchema.default(["sunshine.select-all"]),
  viewBy: viewByFilterSchema.default("latest"),
});
export const useQueryStateTariffsTrendCardFilters = makeUseQueryState(
  tariffsTrendCardFiltersSchema
);
