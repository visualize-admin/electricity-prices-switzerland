import { median } from "d3-array";
import { Observation as QueryObservation } from "../graphql/queries";
import { scaleThreshold } from "d3";
import { PRICE_COLORS } from "./colors";

export type ObservationValue = string | number | boolean | Date;
export type Observation = Record<string, ObservationValue>;

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

export const getColorDomain = ({
  observations,
  accessor,
}: {
  observations: QueryObservation[];
  accessor: (x: QueryObservation) => number;
}) => {
  const m = median(observations, (d) => accessor(d));
  return m && [m * 0.85, m * 0.95, m * 1.05, m * 1.15];
};

export const getColorScale = ({
  observations,
  accessor,
}: {
  observations: QueryObservation[];
  accessor: (x: QueryObservation) => number;
}) => {
  const domain = getColorDomain({ observations, accessor });
  const scale =
    domain &&
    scaleThreshold<number, string>().domain(domain).range(PRICE_COLORS);
  return scale;
};
export const years = [
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
  "2014",
  "2013",
  "2012",
  "2011",
  "2010",
  "2009",
];
export const priceComponents = [
  "total",
  "gridusage",
  "energy",
  "charge",
  "aidfee",
];
export const products = ["standard", "economic"];
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
];
