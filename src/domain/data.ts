import { scaleThreshold, range } from "d3";
import { useMemo } from "react";

import { Observation as QueryObservation } from "src/graphql/queries";

import { useTheme } from "../themes";

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

export const useColorScale = ({
  medianValue,
}: {
  observations: QueryObservation[];
  medianValue: number | undefined;
  accessor: (x: QueryObservation) => number;
}) => {
  const { palettes } = useTheme();

  return useMemo(() => {
    const m = medianValue ?? 0;
    const domain = [m * 0.85, m * 0.95, m * 1.05, m * 1.15];
    const scale = scaleThreshold<number, string>()
      .domain(domain)
      .range(palettes.diverging);

    return scale;
  }, [medianValue, palettes.diverging]);
};

export type Entity = "municipality" | "operator" | "canton";

if (!process.env.FIRST_PERIOD || !process.env.CURRENT_PERIOD) {
  throw Error(
    `Please configure FIRST_PERIOD and CURRENT_PERIOD in next.config.js`
  );
}

export const periods = range(
  parseInt(process.env.CURRENT_PERIOD, 10),
  parseInt(process.env.FIRST_PERIOD, 10) - 1,
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
];
