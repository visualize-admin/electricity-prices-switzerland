import { getSearchSparqlQuery } from "../../rdf/search-queries";

const SearchQueryExample = () => {
  const { sparqlQuery } = getSearchSparqlQuery({
    query: "Zurich",
    types: ["municipality"],
    ids: [],
    limit: 10,
    locale: "fr",
  });
  return <pre>{sparqlQuery.build()}</pre>;
};

export { SearchQueryExample };
