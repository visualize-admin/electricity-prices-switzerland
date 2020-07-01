import rdf from "rdf-ext";
import { Clownface } from "clownface";
import { Source, View } from "@zazuko/rdf-cube-view-query";
import namespace from "@rdfjs/namespace";
import { defaultLocale } from "../locales/locales";

type Cube = $FixMe;
type Node = {
  out: (...args) => Clownface;
};

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  energyPricing: namespace(
    "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/"
  ),
  rdf: namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  schema: namespace("http://schema.org/"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
};

export const getSource = () =>
  new Source({
    endpointUrl: "https://test.lindas.admin.ch/query",
    sourceGraph: "https://lindas.admin.ch/elcom/electricityprice",
    // user: '',
    // password: ''
  });

export const getName = (node: Node, { locale }: { locale: string }) => {
  const term =
    node
      .out(ns.schema.name)
      .terms.find(
        (term) => term.termType === "Literal" && term.language === locale
      ) ??
    node
      .out(ns.schema.name)
      .terms.find(
        (term) => term.termType === "Literal" && term.language === defaultLocale
      ); // FIXME: fall back to all languages in order
  return term?.value;
};

export const getView = (cube: Cube) => View.fromCube(cube);

export const getObservations = async (
  cube: Cube,
  { filters }: { filters: $FixMe[] }
) => {
  const view = View.fromCube(cube, { filters });

  console.log(view.observationsQuery().query.toString());

  return view.observations();
};

export const getCubeDimension = (
  cube: Cube,
  dimensionKey: string,
  { locale }: { locale: string }
) => {
  const view = getView(cube);

  const viewDimension = view.dimensions.find((dimension) => {
    return dimension.cubeDimensions.some((cubeDimension) =>
      cubeDimension.path.equals(ns.energyPricing(dimensionKey))
    );
  });

  const cubeDimension = viewDimension?.cubeDimensions[0];

  if (!cubeDimension) {
    throw Error(`No dimension for '${dimensionKey}'`);
  }

  const iri = cubeDimension.path.value;
  const min = cubeDimension.minInclusive?.value;
  const max = cubeDimension.maxInclusive?.value;
  const name = getName(cubeDimension, { locale });

  return {
    iri,
    name,
    min,
    max,
    datatype: cubeDimension.datatype,
    dimension: viewDimension,
  };
};

export const buildDimensionFilter = (
  cube: Cube,
  dimensionKey: string,
  filters: string[]
) => {
  const view = getView(cube);

  const viewDimension = view.dimensions.find((dimension) => {
    return dimension.cubeDimensions.some((cubeDimension) =>
      cubeDimension.path.equals(ns.energyPricing(dimensionKey))
    );
  });

  const cubeDimension = viewDimension?.cubeDimensions[0];

  if (!cubeDimension) {
    throw Error(`No dimension for '${dimensionKey}'`);
  }

  const { datatype } = cubeDimension;

  const dimensionFilter =
    filters.length === 1
      ? viewDimension.filter.eq(
          datatype
            ? rdf.literal(filters[0], datatype)
            : rdf.namedNode(filters[0])
        )
      : viewDimension.filter.in(
          filters.map((f) => {
            return datatype ? rdf.literal(f, datatype) : rdf.namedNode(f);
          })
        );

  return dimensionFilter;
};
