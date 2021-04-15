import namespace from "@rdfjs/namespace";

export { rdf, schema, sh } from "@tpluscode/rdf-ns-builders";

export const schemaAdmin = namespace("https://schema.ld.admin.ch/");
// export const adminTerm = namespace("https://ld.admin.ch/definedTerm/");

// export const cube = namespace("https://cube.link/");
// export const cubeView = namespace("https://cube.link/view/");
// export const cubeMeta = namespace("https://cube.link/meta/");

export const visualizeAdmin = namespace("https://visualize.admin.ch/");

export const electricityprice = namespace(
  "https://energy.ld.admin.ch/elcom/electricityprice/"
);
export const electricitypriceDimension = namespace(
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/"
);
// FIXME: remove redundancy
export const electricitypriceDimension2 = namespace(
  "https://energy.ld.admin.ch/elcom/electricity-price/dimension/"
);

export const municipality = namespace(
  "https://register.ld.admin.ch/municipality/"
);
export const canton = namespace("https://register.ld.admin.ch/canton/");

/**
 * Strips the namespace from an IRI to get shorter IDs
 *
 * E.g. "http://classifications.data.admin.ch/municipality/123" -> "123"
 * E.g. "https://energy.ld.admin.ch/elcom/electricityprice/category/H1" -> "H1"
 */
export const stripNamespaceFromIri = ({
  dimension,
  iri,
}: {
  dimension: string;
  iri: string;
}): string => {
  const matches = iri.match(/\/([a-zA-Z0-9]+)$/);

  if (!matches) {
    // Warn?
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
  return electricityprice(`${dimension}/${id}`).value;
};
