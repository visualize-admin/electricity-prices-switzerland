import namespace from "@rdfjs/namespace";

// eslint-disable-next-line
// @ts-ignore - Package import is reported as a problem in tsgo - TODO Recheck later if we can remove this
export { rdf, schema } from "@tpluscode/rdf-ns-builders";

export const schemaAdmin = namespace("https://schema.ld.admin.ch/");
export const electricityPrice = namespace(
  "https://energy.ld.admin.ch/elcom/electricityprice/"
);
export const electricityPriceDimension = namespace(
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/"
);
export const municipality = namespace("https://ld.admin.ch/municipality/");
export const canton = namespace("https://ld.admin.ch/canton/");

/**
 * Strips the namespace from an IRI to get shorter IDs
 *
 * E.g. "http://classifications.data.admin.ch/municipality/123" -> "123"
 * E.g. "https://energy.ld.admin.ch/elcom/electricityprice/category/H1" -> "H1"
 */
export const stripNamespaceFromIri = ({ iri }: { iri: string }): string => {
  const matches = iri.match(/\/([a-zA-Z0-9]+)$/);

  if (!matches) {
    return iri;
  }

  return matches[1];
};

/**
 * Adds the namespace to an ID to get the full IRI
 *
 * E.g. "municipality" "123" -> "http://classifications.data.admin.ch/municipality/123"
 * E.g. "category" "H1" -> "https://energy.ld.admin.ch/elcom/electricityprice/category/H1"
 */
export const addNamespaceToID = ({
  dimension,
  id,
}: {
  dimension: string;
  id: string;
}): string => {
  // Check for full IRIs
  if (id.match(/^http(s)?:\/\//)) {
    return id;
  }

  if (dimension === "municipality") {
    return municipality(`${id}`).value;
  }

  if (dimension === "canton" || dimension === "region") {
    return canton(`${id}`).value;
  }

  return electricityPrice(`${dimension}/${id}`).value;
};
