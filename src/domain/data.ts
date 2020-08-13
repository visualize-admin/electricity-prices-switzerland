import { scaleThreshold } from "d3";
import { median } from "d3-array";
import { useMemo } from "react";
import {
  Observation,
  Observation as QueryObservation,
} from "../graphql/queries";
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

const getColorDomain = ({
  observations,
  accessor,
}: {
  observations: QueryObservation[];
  accessor: (x: QueryObservation) => number;
}) => {
  const m = median(observations, (d) => accessor(d)) ?? 0;
  const domain = [m * 0.85, m * 0.95, m * 1.05, m * 1.15];
  return domain;
};

export const useColorScale = ({
  observations,
  accessor,
}: {
  observations: QueryObservation[];
  accessor: (x: QueryObservation) => number;
}) => {
  const { palettes } = useTheme();

  return useMemo(() => {
    const domain = getColorDomain({ observations, accessor });
    const scale = scaleThreshold<number, string>()
      .domain(domain)
      .range(palettes.diverging);

    return scale;
  }, [observations, accessor, palettes.diverging]);
};

export type Entity = "municipality" | "provider" | "canton"; //| "canton";
export const getEntityLabelField = (entity: Entity): keyof Observation =>
  entity === "municipality"
    ? "municipalityLabel"
    : entity === "provider"
    ? "providerLabel"
    : "cantonLabel";

export const periods = [
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
export const products = ["standard", "cheapest"];
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
