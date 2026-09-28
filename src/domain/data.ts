import { group, mean, range } from "d3";
import z from "zod";

import { runtimeEnv } from "src/env/runtime";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { isDefined } from "src/utils/is-defined";
import { weightedMean } from "src/utils/weighted-mean";

export type ObservationValue = string | number | boolean | Date | null;
export type GenericObservation = Record<string, ObservationValue>;

type ComponentFields_NominalDimension_Fragment = {
  __typename: "NominalDimension";
  iri: string;
  label: string;
};

type ComponentFields_OrdinalDimension_Fragment = {
  __typename: "OrdinalDimension";
  iri: string;
  label: string;
};

type ComponentFields_TemporalDimension_Fragment = {
  __typename: "TemporalDimension";
  iri: string;
  label: string;
};

type ComponentFields_Measure_Fragment = {
  __typename: "Measure";
  iri: string;
  label: string;
};

type ComponentFields_Attribute_Fragment = {
  __typename: "Attribute";
  iri: string;
  label: string;
};

export type ComponentFieldsFragment =
  | ComponentFields_NominalDimension_Fragment
  | ComponentFields_OrdinalDimension_Fragment
  | ComponentFields_TemporalDimension_Fragment
  | ComponentFields_Measure_Fragment
  | ComponentFields_Attribute_Fragment;

export type Entity = "municipality" | "operator" | "canton";

if (!runtimeEnv.FIRST_PERIOD || !runtimeEnv.CURRENT_PERIOD) {
  throw Error(
    `Please configure FIRST_PERIOD and CURRENT_PERIOD in next.config.js`
  );
}

export const periods = range(
  parseInt(runtimeEnv.CURRENT_PERIOD, 10),
  parseInt(runtimeEnv.FIRST_PERIOD, 10) - 1,
  -1
).map((d) => d.toString());

export const allPriceComponents = [
  "total",
  "gridusage",
  /**
   * Metering costs are measured in CHF per year. For comparing between operators (on the map),
   * this is the value that is used.
   */
  "annualmeteringcost",
  /*
   * For the details display, they are converted by Elcom to Rp/kWh to align with other price components.
   */
  "meteringrate",
  "energy",
  "charge",

  /** We need to keep aidfee even if not shown on the map for the total to be OK */
  "aidfee",
] as const;

export type PriceComponent = (typeof allPriceComponents)[number];

export const mapPriceComponents = allPriceComponents.filter(
  (x) => x !== "meteringrate" && x !== "aidfee"
);
export const detailsPriceComponents = allPriceComponents.filter(
  (x) => x !== "annualmeteringcost"
);

export type DetailPriceComponent = (typeof detailsPriceComponents)[number];

export const products = ["cheapest", "standard"] as const;

export type PriceProduct = (typeof products)[number];

export const ElectricityCategory = z.enum([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "H7",
  "H8",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
]);

export const networkLevels = ["NE5", "NE6", "NE7"] as const;
export type NetworkLevelId = (typeof networkLevels)[number];

export const categories = ElectricityCategory.options;

export type ElectricityCategory = z.infer<typeof ElectricityCategory>;

const isElectricityCategory = (
  category: string
): category is ElectricityCategory => {
  return categories.includes(category as ElectricityCategory);
};

export const asElectricityCategory = (
  category: string
): ElectricityCategory => {
  if (isElectricityCategory(category)) {
    return category;
  }
  throw new Error(
    `Invalid electricity category: ${category}. Must be one of: ${categories.join(
      ", "
    )}`
  );
};

export type ValueFormatter = (value: number) => string;

/*
 * Entity figures. An entity (municipality, operator, canton) is backed by
 * several observation rows; every view (map colors, legend, tooltip, list,
 * detail panel, chart) takes the entity's figure from these functions, never
 * from one of its rows' `value`. The canton figure is the median computed
 * server-side (`cantonMedianObservations`).
 */

/**
 * Municipality-level value: its operators' values weighted by the share of
 * the municipality each one covers. Rows without a value are ignored.
 */
export const getMunicipalityValue = (
  observations: Pick<
    OperatorObservationFieldsFragment,
    "value" | "coverageRatio"
  >[]
): number | null => {
  const withValue = observations.filter((d) => isDefined(d.value));
  if (withValue.length === 0) return null;
  return weightedMean(
    withValue,
    (d) => d.value!,
    (d) => d.coverageRatio
  );
};

/**
 * Operator-level value: mean of the operator's values across the
 * municipalities it serves. Values can differ per municipality, e.g.
 * charges to the community.
 */
export const getOperatorMeanValue = (
  observations: { value?: number | null }[]
): number | null => mean(observations, (d) => d.value ?? undefined) ?? null;

/**
 * One observation per operator and period, valued with `getOperatorMeanValue`.
 * Municipality fields are cleared as the result spans several municipalities.
 */
export const averageOperatorObservationsByPeriod = <
  T extends {
    operator: string;
    period: string;
    value?: number | null;
    municipality: string;
    municipalityLabel?: string | null;
  }
>(
  observations: T[]
): T[] =>
  Array.from(
    group(
      observations,
      (d) => d.operator,
      (d) => d.period
    ).values()
  ).flatMap((observationsByPeriod) =>
    Array.from(observationsByPeriod.values(), (periodObservations) => ({
      ...periodObservations[0],
      municipality: "",
      municipalityLabel: null,
      value: getOperatorMeanValue(periodObservations),
    }))
  );

export type SettlementDensity =
  | "High"
  | "Medium"
  | "Rural"
  | "Mountain"
  | "Tourist"
  | "N.A.";
export type EnergyDensity = "High" | "Low" | "N.A.";
