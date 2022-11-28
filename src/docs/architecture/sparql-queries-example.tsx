import { getSearchSparqlQuery } from "../../rdf/search-queries";
import { useValues, Fields } from "../fields";

const SearchQueryExample = () => {
  const { fields, values } = useValues({
    query: {
      value: "Zurich",
      choices: ["Zurich", "Bern", "Lausanne"],
    },
    locale: {
      value: "fr",
      choices: ["de", "fr", "en"],
    },
    limit: {
      value: "10",
      min: 0,
      max: 100,
    },
  });
  const { sparqlQuery } = getSearchSparqlQuery({
    query: values.query,
    types: ["municipality"],
    ids: [],
    limit: parseInt(values.limit, 10),
    locale: values.locale,
  });
  return (
    <>
      <Fields fields={fields} />
      <pre>{sparqlQuery.build()}</pre>
    </>
  );
};

export { SearchQueryExample };
