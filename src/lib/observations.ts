import { Literal, NamedNode } from "rdf-js";

import * as ns from "src/rdf/namespace";

type ObservationValue = string | number | boolean | null;

export type Observation = Record<string, ObservationValue>;

const xmlSchema = "http://www.w3.org/2001/XMLSchema#";
const parseRDFLiteral = (value: Literal): ObservationValue => {
  const v = value.value;
  const dt = value.datatype.value.replace(xmlSchema, "");
  if (dt === "https://cube.link/Undefined") {
    return null;
  }
  switch (dt) {
    case "string":
      return v;
    case "boolean":
      return v === "true" ? true : false;
    case "float":
    case "integer":
    case "long":
    case "double":
    case "decimal":
    case "nonPositiveInteger":
    case "nonNegativeInteger":
    case "negativeInteger":
    case "int":
    case "unsignedLong":
    case "positiveInteger":
    case "short":
    case "unsignedInt":
    case "byte":
    case "unsignedShort":
    case "unsignedByte":
      return +v;
    // TODO: Figure out how to preserve granularity of date (maybe include interval?)
    // case "date":
    // case "time":
    // case "dateTime":
    // case "gYear":
    // case "gYearMonth":
    //   return new Date(v);
    default:
      return v;
  }
};

/**
 * Parse observation values (values returned from query.execute()) to native JS types
 *
 * @param observationValue
 */
const parseObservationValue = (
  value: Literal | NamedNode
): ObservationValue => {
  // Parse literals to native JS types
  if (value.termType === "Literal") {
    return parseRDFLiteral(value);
  }

  // Return the IRI of named nodes
  return value.value;
};

export const parseObservation = (
  d: Record<string, Literal | NamedNode<string> | null>
) => {
  const parsed: { [k: string]: string | number | boolean | null } = {};
  const electricityPriceDimensionPrefix = ns.electricityPriceDimension().value;

  for (const [k, v] of Object.entries(d)) {
    const key = k.replace(electricityPriceDimensionPrefix, "");

    const parsedValue = v ? parseObservationValue(v) : null;

    parsed[key] =
      typeof parsedValue === "string"
        ? ns.stripNamespaceFromIri({ iri: parsedValue })
        : parsedValue;
  }

  return parsed;
};
