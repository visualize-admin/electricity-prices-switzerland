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

type DimensionFieldsWithValues_NominalDimension_Fragment = {
  __typename: "NominalDimension";
  iri: string;
  label: string;
  values: Array<{ __typename: "DimensionValue"; value: string; label: string }>;
};

type DimensionFieldsWithValues_OrdinalDimension_Fragment = {
  __typename: "OrdinalDimension";
  iri: string;
  label: string;
  values: Array<{ __typename: "DimensionValue"; value: string; label: string }>;
};

type DimensionFieldsWithValues_TemporalDimension_Fragment = {
  __typename: "TemporalDimension";
  iri: string;
  label: string;
  values: Array<{ __typename: "DimensionValue"; value: string; label: string }>;
};

export type DimensionFieldsWithValuesFragment =
  | DimensionFieldsWithValues_NominalDimension_Fragment
  | DimensionFieldsWithValues_OrdinalDimension_Fragment
  | DimensionFieldsWithValues_TemporalDimension_Fragment;
