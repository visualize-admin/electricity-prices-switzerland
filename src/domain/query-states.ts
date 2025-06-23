import * as z from "zod";

import buildEnv from "src/env/build";
import {
  makeLinkGenerator,
  makeUseQueryState,
  UseQueryStateSingle,
} from "src/lib/use-query-state";

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

const mapTabsSchema = z.enum(["electricity", "sunshine"] as const);

const mapCommonSchema = z.object({
  tab: mapTabsSchema.default("electricity"),
  activeId: z.string().nullable().default(null),
});

const periodSchema = z.string().default(buildEnv.CURRENT_PERIOD);

const energyPricesMapSchema = z.object({
  tab: mapTabsSchema.default("electricity"),
  operator: z.string().optional(),
  period: periodSchema,
  municipality: z.string().optional(),
  canton: z.string().optional(),
  category: z.string().default("H4"),
  priceComponent: z.string().default("total"),
  product: z.string().default("standard"),
  download: z.string().optional(),
  cantonsOrder: z.string().default("median-asc"),
  view: z.string().default("collapsed"),
});
const energyPricesDetailsSchema = z.object({
  operator: stringToArray().optional(),
  period: stringToArray([buildEnv.CURRENT_PERIOD]),
  municipality: stringToArray([]),
  canton: stringToArray([]),
  category: stringToArray(["H4"]),
  priceComponent: stringToArray(["total"]),
  product: stringToArray(["standard"]),
  cantonsOrder: stringToArray(["median-asc"]),
  download: z.string().optional(),
  view: stringToArray(["collapsed"]),
});

const sunshineIndicatorSchema = z.enum([
  "networkCosts",
  "netTariffs",
  "energyTariffs",
  "saidi",
  "saifi",
] as const);

const sunshineMapSchema = z.object({
  tab: mapTabsSchema.default("sunshine"),
  period: periodSchema,
  viewBy: z.string().default("all_grid_operators"),
  typology: z.string().default("total"),
  indicator: sunshineIndicatorSchema.default("saidi"),
  energyTariffCategory: z.string().default("EC2"),
  netTariffCategory: z.string().default("NC2"),
  networkLevel: z.string().default("NE5"),
  activeId: z.string().optional(),
});

const detailTabsSchema = z.union([sunshineIndicatorSchema, z.undefined()]); // TODO Add Operational Standards page

export type QueryStateSunshineIndicator = QueryStateSunshineMap["indicator"];

export const getSunshineDetailsPageFromIndicator = (
  indicator: QueryStateSunshineMap["indicator"]
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

export const sunshineDetailsLink = makeLinkGenerator(sunshineDetailsSchema);

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

export type QueryStateEnergyPricesMap = UseQueryStateSingle<
  typeof energyPricesMapSchema.shape
>;

export type QueryStateSunshineMap = UseQueryStateSingle<
  typeof sunshineMapSchema.shape
>;

export type QueryStateSingleSunshineDetails = UseQueryStateSingle<
  typeof sunshineDetailsSchema.shape
>;
