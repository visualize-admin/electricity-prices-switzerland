import * as z from "zod";

import buildEnv from "src/env/build";
import {
  makeLinkGenerator,
  makeUseQueryState,
  UseQueryStateSingle,
} from "src/lib/use-query-state";

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
  operator: z.array(z.string()).optional(),
  period: z.array(periodSchema).default([buildEnv.CURRENT_PERIOD]),
  municipality: z.array(z.string()).default([]),
  canton: z.array(z.string()).default([]),
  category: z.array(z.string()).default(["H4"]),
  priceComponent: z.array(z.string()).default(["total"]),
  product: z.array(z.string()).default(["standard"]),
  cantonsOrder: z.array(z.string()).default(["median-asc"]),
  download: z.string().optional(),
  view: z.array(z.string()).default(["collapsed"]),
});

const sunshineIndicatorSchema = z.enum([
  "networkCosts",
  "netTariffs",
  "energyTariffs",
  "saidi",
  "saifi",
] as const);

const mapSunshineSchema = z.object({
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

export type QueryStateSunshineIndicator = QueryStateSingleSunshine["indicator"];

export const getSunshineDetailsPageFromIndicator = (
  indicator: QueryStateSingleSunshine["indicator"]
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
export const useQueryStateSunshineMap = makeUseQueryState(mapSunshineSchema);

// Details pages
export const useQueryStateEnergyPricesDetails = makeUseQueryState(
  energyPricesDetailsSchema
);
export const useQueryStateSunshineDetails = makeUseQueryState(
  sunshineDetailsSchema
);

export type QueryStateSingleElectricity = UseQueryStateSingle<
  typeof energyPricesMapSchema.shape
>;
/** @knipignore */

export type QueryStateSingleSunshine = UseQueryStateSingle<
  typeof mapSunshineSchema.shape
>;

export type QueryStateSingleSunshineDetails = UseQueryStateSingle<
  typeof sunshineDetailsSchema.shape
>;
