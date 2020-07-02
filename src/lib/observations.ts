
import { Literal, NamedNode } from "rdf-js";

export type RawObservationValue = {
  value: Literal | NamedNode;
  label?: Literal;
};

export type RawObservation = Record<string, RawObservationValue>;

export type ObservationValue = string | number | boolean | Date;

export type Observation = Record<string, ObservationValue>;

const xmlSchema = "http://www.w3.org/2001/XMLSchema#";
const parseRDFLiteral = (value: Literal): ObservationValue => {
  const v = value.value;
  const dt = value.datatype.value.replace(xmlSchema, "");
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
 * Parse observation values (values returnd from query.execute()) to native JS types
 *
 * @param observationValue
 */
export const parseObservationValue = (value: Literal | NamedNode): ObservationValue => {
  // Parse literals to native JS types
  if (value.termType === "Literal") {
    return parseRDFLiteral(value);
  }

  // Return the IRI of named nodes
  return value.value;
};