import namespace from "@rdfjs/namespace";

export { rdf, schema, sh } from "@tpluscode/rdf-ns-builders";

export const schemaAdmin = namespace("https://schema.ld.admin.ch/");
// export const adminTerm = namespace("https://ld.admin.ch/definedTerm/");

// export const cube = namespace("https://cube.link/");
// export const cubeView = namespace("https://cube.link/view/");
// export const cubeMeta = namespace("https://cube.link/meta/");

export const visualizeAdmin = namespace("https://visualize.admin.ch/");

export const energyPricingValue = namespace(
  "https://energy.ld.admin.ch/elcom/electricityprice/"
);
export const energyPricing = namespace(
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/"
);
// FIXME: remove redundancy
export const energyPricing2 = namespace(
  "https://energy.ld.admin.ch/elcom/electricity-price/dimension/"
);

export const municipality = namespace(
  "https://register.ld.admin.ch/municipality/"
);
export const canton = namespace("https://register.ld.admin.ch/canton/");
