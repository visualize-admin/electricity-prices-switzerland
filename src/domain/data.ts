import { range } from "d3";

import buildEnv from "src/env/build";

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

export const priceComponents = [
  "total",
  "gridusage",
  "energy",
  "charge",
  "aidfee",
];
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

export const tariffCategories = [
  // EC
  "EC2",
  "EC3",
  "EC4",
  "EC6",

  // EH
  "EH2",
  "EH4",
  "EH7",

  // NC
  "NC2",
  "NC3",
  "NC4",
  "NC6",

  // NH
  "NH2",
  "NH4",
  "NH7",
] as const;

export type TariffCategory = (typeof tariffCategories)[number];
// TODO Mapping should be at graphql level, we should be able to remove
// this function when this is done
export const asTariffCategory = (category: string): TariffCategory => {
  if (
    category === "EC2" ||
    category === "EC3" ||
    category === "EC4" ||
    category === "EC6" ||
    category === "EH2" ||
    category === "EH4" ||
    category === "EH7" ||
    category === "NC2" ||
    category === "NC3" ||
    category === "NC4" ||
    category === "NC6" ||
    category === "NH2" ||
    category === "NH4" ||
    category === "NH7"
  ) {
    return category as TariffCategory;
  }
  throw new Error(`Invalid network category: ${category}`);
};

export type ValueFormatter = (value: number) => string;
