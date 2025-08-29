import { range } from "d3";

import buildEnv from "src/env/build";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { weightedMean } from "src/utils/weighted-mean";

export type ObservationValue = string | number | boolean | Date;
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

if (!buildEnv.FIRST_PERIOD || !buildEnv.CURRENT_PERIOD) {
  throw Error(
    `Please configure FIRST_PERIOD and CURRENT_PERIOD in next.config.js`
  );
}

export const periods = range(
  parseInt(buildEnv.CURRENT_PERIOD, 10),
  parseInt(buildEnv.FIRST_PERIOD, 10) - 1,
  -1
).map((d) => d.toString());

export const allPriceComponents = [
  "total",
  "gridusage",
  "energy",
  "charge",
  /**
   * Metering costs are measured in CHF per year. For comparing between operators (on the map),
   * this is the value that is used.
   */
  "annualmeteringcost",
  /*
   * For the details display, they are converted by Elcom to Rp/kWh to align with other price components.
   */
  "meteringrate",

  /** We need to keep aidfee even if not shown on the map for the total to be OK */
  "aidfee",
] as const;

export const mapPriceComponents = allPriceComponents.filter(
  (x) => x !== "meteringrate" && x !== "aidfee"
);
export const detailsPriceComponents = allPriceComponents.filter(
  (x) => x !== "annualmeteringcost"
);

export const products = ["cheapest", "standard"];
export const categories = [
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
] as const;

export type ElectricityCategory = (typeof categories)[number];

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

export const getObservationsWeightedMean = (
  obs: OperatorObservationFieldsFragment[]
) => {
  return weightedMean(
    obs,
    (d) => d.value ?? 0,
    (d) => d.coverageRatio
  );
};
