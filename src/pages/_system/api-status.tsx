import { ReactNode } from "react";
import { Box, Heading, Flex } from "theme-ui";
import { UseQueryState } from "urql";
import { LoadingIconInline } from "../../components/hint";
import * as Queries from "../../graphql/queries";

const IndicatorFail = () => (
  <Box
    sx={{
      display: "inline-block",
      py: 1,
      px: 2,
      borderRadius: "circle",
      bg: "error",
      color: "#fff",
      fontSize: 2,
      lineHeight: 1,
    }}
  >
    FAIL
  </Box>
);
const IndicatorSuccess = () => (
  <Box
    sx={{
      display: "inline-block",
      py: 1,
      px: 2,
      borderRadius: "circle",
      bg: "success",
      color: "#fff",
      fontSize: 2,
      lineHeight: 1,
    }}
  >
    OK
  </Box>
);

const Status = ({ title, query }: { title: string; query: UseQueryState }) => {
  return (
    <Box
      sx={{
        py: 2,
        px: 3,
        borderRadius: 3,
        bg: "monochrome200",
        mb: 3,
        borderColor: "monochrome400",
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      <Heading
        variant="heading3"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {query.fetching ? (
          <LoadingIconInline size={24} />
        ) : query.error ? (
          <IndicatorFail />
        ) : (
          <IndicatorSuccess />
        )}
        <Box as="span" sx={{ ml: 2, flexGrow: 1 }}>
          {title}
        </Box>
      </Heading>
      {!query.fetching && (
        <>
          <Box sx={{ fontSize: 2, mt: 2 }}>
            <details>
              <summary>Details</summary>

              <pre>
                <code>
                  Variables:{" "}
                  {JSON.stringify(query.operation?.variables, null, 2)}
                </code>
              </pre>
              {query.error && (
                <pre>
                  <code>Error: {JSON.stringify(query.error, null, 2)}</code>
                </pre>
              )}
              {query.data && (
                <pre>
                  <code>Data: {JSON.stringify(query.data, null, 2)}</code>
                </pre>
              )}
            </details>
          </Box>
        </>
      )}
    </Box>
  );
};

const SystemInfoStatus = () => {
  const [query] = Queries.useSystemInfoQuery();
  return <Status title="System API" query={query} />;
};

const WikiContentStatus = () => {
  const [query] = Queries.useWikiContentQuery({
    variables: { locale: "de", slug: "help-price-comparison" },
  });
  return <Status title="Content API" query={query} />;
};

const MunicipalitiesStatus = () => {
  const [query] = Queries.useMunicipalitiesQuery({
    variables: { locale: "de", ids: ["261", "700"], query: "Ber" },
  });
  return <Status title="Municipalities (ID + Query)" query={query} />;
};

const CantonsStatus = () => {
  const [query] = Queries.useCantonsQuery({
    variables: { locale: "de", ids: ["1"], query: "Ber" },
  });
  return <Status title="Cantons (ID + Query)" query={query} />;
};

const OperatorStatus = () => {
  const [query] = Queries.useOperatorsQuery({
    variables: { locale: "de", ids: ["565"], query: "lausanne" },
  });
  return <Status title="Operators (ID + Query)" query={query} />;
};

const SearchStatus = () => {
  const [query] = Queries.useSearchQuery({
    variables: { locale: "de", query: "lausanne" },
  });
  return <Status title="Search (Query)" query={query} />;
};

const SearchZipStatus = () => {
  const [query] = Queries.useSearchQuery({
    variables: { locale: "de", query: "3000" },
  });
  return <Status title="Search (PLZ)" query={query} />;
};

const ObservationsStatus = () => {
  const [query] = Queries.useObservationsWithAllPriceComponentsQuery({
    variables: {
      locale: "de",
      observationKind: Queries.ObservationKind.Municipality,
      filters: {
        canton: ["261"],
        period: ["2021"],
        category: ["H4"],
        product: ["standard"],
      },
    },
  });
  return (
    <Status
      title="Municipalitiy Observations (All Price Components)"
      query={query}
    />
  );
};

const CantonMedianStatus = () => {
  const [query] = Queries.useObservationsWithAllPriceComponentsQuery({
    variables: {
      locale: "de",
      observationKind: Queries.ObservationKind.Canton,
      filters: {
        canton: ["1", "2"],
        period: ["2021"],
        category: ["H4"],
        product: ["standard"],
      },
    },
  });
  return (
    <Status
      title="Canton Median Observations (All Price Components)"
      query={query}
    />
  );
};

const SwissMedianStatus = () => {
  const [query] = Queries.useObservationsQuery({
    variables: {
      locale: "de",
      observationKind: Queries.ObservationKind.Canton,
      priceComponent: Queries.PriceComponent.Total,
      filters: {
        canton: [],
        period: ["2021"],
        category: ["H4"],
        product: ["standard"],
      },
    },
  });
  return <Status title="Swiss Median Observations " query={query} />;
};

const Page = () => {
  return (
    <Box sx={{ p: 5 }}>
      <Heading variant="heading1">API Status</Heading>

      <Heading variant="heading2" sx={{ mt: 3 }}>
        Internal
      </Heading>

      <SystemInfoStatus />

      <WikiContentStatus />

      <Heading variant="heading2" sx={{ mt: 3 }}>
        Data
      </Heading>

      <ObservationsStatus />

      <CantonMedianStatus />

      <SwissMedianStatus />

      <Heading variant="heading2" sx={{ mt: 3 }}>
        Search
      </Heading>

      <MunicipalitiesStatus />

      <CantonsStatus />

      <OperatorStatus />

      <SearchStatus />

      <SearchZipStatus />
    </Box>
  );
};

export default Page;
