import {
  Box,
  BoxProps,
  Link,
  Typography,
  TypographyProps,
} from "@mui/material";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { OperationResult, UseQueryState } from "urql";

import { LoadingIconInline } from "src/components/hint";
import * as Queries from "src/graphql/queries";
import { DebugDownloadGetResponse } from "src/pages/api/debug-download";
import { defaultSparqlEndpointUrl } from "src/rdf/sparql-client";
import createGetServerSideProps from "src/utils/create-server-side-props";

const IndicatorFail = () => (
  <Box
    display="inline-block"
    py={1}
    px={2}
    borderRadius={9999}
    bgcolor="error.main"
    color="#fff"
    fontSize="0.75rem"
    lineHeight="1rem"
  >
    FAIL
  </Box>
);

const IndicatorSuccess = () => (
  <Box
    display="inline-block"
    py={1}
    px={2}
    borderRadius={9999}
    bgcolor="success.main"
    color="#fff"
    fontSize="0.75rem"
    lineHeight="1rem"
  >
    OK
  </Box>
);

const StatusHeading = ({ children, ...props }: TypographyProps) => {
  return (
    <Typography
      variant="h3"
      {...props}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        ...props.sx,
      }}
    >
      {children}
    </Typography>
  );
};

const StatusBox = (props: BoxProps) => {
  return (
    <Box
      {...props}
      role="listitem"
      py={2}
      px={3}
      bgcolor="secondary.100"
      mb={3}
      borderRadius={2}
      borderColor="secondary.300"
      sx={{
        borderWidth: 1,
        borderStyle: "solid",
        ...props.sx,
      }}
    >
      {props.children}
    </Box>
  );
};

const Status = ({
  title,
  query,
}: {
  title: string;
  query: Pick<UseQueryState, "fetching" | "data"> & {
    error?:
      | NonNullable<UseQueryState["error"]>
      | {
          message: string;
        }
      | undefined
      | null;
    operation?:
      | Pick<NonNullable<UseQueryState["operation"]>, "variables">
      | undefined
      | null;
  };
}) => {
  return (
    <StatusBox>
      <StatusHeading>
        {query.fetching ? (
          <LoadingIconInline size={24} />
        ) : query.error ? (
          <IndicatorFail />
        ) : (
          <IndicatorSuccess />
        )}
        <Box component="span" ml={2} flexGrow={1}>
          {title}
        </Box>
      </StatusHeading>
      {!query.fetching && (
        <Box fontSize="0.75rem" mt={2}>
          <details>
            <summary>Details</summary>

            <pre>
              <code>
                Variables: {JSON.stringify(query.operation?.variables, null, 2)}
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
      )}
    </StatusBox>
  );
};

const SystemInfoStatus = ({ query }: { query: PageProps["systemInfo"] }) => {
  return <Status title="System API" query={query} />;
};

const WikiContentStatus = ({ query }: { query: PageProps["wikiContent"] }) => {
  return <Status title="Content API" query={query} />;
};

const MunicipalitiesStatus = ({
  query,
}: {
  query: PageProps["municipalities"];
}) => {
  return <Status title="Municipalities (ID + Query)" query={query} />;
};

const CantonsStatus = ({ query }: { query: PageProps["cantons"] }) => {
  return <Status title="Cantons (ID + Query)" query={query} />;
};

const OperatorStatus = ({ query }: { query: PageProps["operators"] }) => {
  return <Status title="Operators (ID + Query)" query={query} />;
};

const SearchStatus = ({ query }: { query: PageProps["search"] }) => {
  return <Status title="Search (Query)" query={query} />;
};

const SearchZipStatus = ({ query }: { query: PageProps["searchZip"] }) => {
  return <Status title="Search (PLZ)" query={query} />;
};

const ObservationsStatus = ({
  query,
}: {
  query: PageProps["observations"];
}) => {
  return (
    <Status
      title="Municipality Observations (All Price Components)"
      query={query}
    />
  );
};

const CantonMedianStatus = ({
  query,
}: {
  query: PageProps["cantonMedian"];
}) => {
  return (
    <Status
      title="Canton Median Observations (All Price Components)"
      query={query}
    />
  );
};

const SwissMedianStatus = ({ query }: { query: PageProps["swissMedian"] }) => {
  return <Status title="Swiss Median Observations " query={query} />;
};

const CubeHealth = ({ query }: { query: PageProps["cubeHealth"] }) => {
  return <Status title="Cube health" query={query} />;
};

const SectionHeading = (props: TypographyProps) => {
  return (
    <Typography variant="h2" {...props} sx={{ mb: 3, ...props.sx }}>
      {props.children}
    </Typography>
  );
};

const Page = ({
  cubeHealth,
  systemInfo,
  wikiContent,
  municipalities,
  cantons,
  operators,
  search,
  searchZip,
  observations,
  cantonMedian,
  swissMedian,
  defaultEndpoint,
  sessionEndpoint,
}: PageProps) => {
  return (
    <Box p={5} display="flex" flexDirection="column" gap={4}>
      <Box maxWidth={600}>
        <Typography variant="h1" mb={3}>
          Configuration
        </Typography>
        <Typography variant="body1" mb={1}>
          Default SPARQL Endpoint: {defaultEndpoint}
        </Typography>

        <Typography variant="body1" mb={1}>
          Session SPARQL Endpoint: {sessionEndpoint?.value}
        </Typography>
        {sessionEndpoint?.value && sessionEndpoint.value !== defaultEndpoint ? (
          <Typography variant="body2" mb={1} color="warning.main">
            ⚠️ Warning: Your session SPARQL endpoint differs from the default
            endpoint. This means you may see different data from users if the
            two endpoints data are not in sync. Go to{" "}
            <Link href="/api/session-config">Session Config</Link> if you want
            to change it.
          </Typography>
        ) : null}
      </Box>

      <Typography variant="h1">API Status</Typography>
      <Box
        display="grid"
        gridTemplateAreas={`
          "api-status data-status"
          "search-status data-status"`}
        gridTemplateColumns="1fr 1fr"
        gridTemplateRows="auto auto"
        gap={4}
      >
        <Box gridArea="api-status">
          <SectionHeading>Internal</SectionHeading>

          <SystemInfoStatus query={systemInfo} />

          <WikiContentStatus query={wikiContent} />
        </Box>

        <Box gridArea="data-status">
          <SectionHeading>Data (Lindas)</SectionHeading>

          <CubeHealth query={cubeHealth} />

          <ObservationsStatus query={observations} />

          <CantonMedianStatus query={cantonMedian} />

          <SwissMedianStatus query={swissMedian} />

          <SunshineMedianStatus />

          <DocumentDownloadStatus />

          <MunicipalityStatus />
        </Box>

        <Box gridArea="search-status">
          <SectionHeading>Search</SectionHeading>

          <MunicipalitiesStatus query={municipalities} />

          <CantonsStatus query={cantons} />

          <OperatorStatus query={operators} />

          <SearchStatus query={search} />

          <SearchZipStatus query={searchZip} />
        </Box>
      </Box>
    </Box>
  );
};

const useManualQuery = <T, A extends unknown[]>({
  queryFn,
}: {
  queryFn: (...args: A) => Promise<T>;
}) => {
  const [state, setState] = useState({
    data: null as T | null,
    error: null as Error | null,
    status: "idle" as "idle" | "fetching" | "fetched" | "error",
  });
  const execute = useCallback(
    async (...args: A) => {
      setState((s) => ({ ...s, data: null, status: "fetching" }));
      try {
        const data = await queryFn(...args);
        setState((s) => ({ ...s, data, status: "fetched" }));
      } catch (e) {
        setState((s) => ({ ...s, error: e as Error, status: "error" }));
      } finally {
        setState((s) => ({ ...s, fetching: false }));
      }
    },
    [queryFn]
  );
  return [state, execute] as const;
};

const useLindasQuery = () => {
  const [query, execute] = useManualQuery({
    queryFn: async (options: {
      endpoint: string;
      sparqlQuery: string;
      mode: "describe" | "select";
    }) => {
      return fetch(options.endpoint, {
        method: "POST",
        body: `query=${encodeURIComponent(options.sparqlQuery)}`,
        headers:
          options.mode === "describe"
            ? {
                Accept: "application/n-triples",
                "Content-Type": "application/x-www-form-urlencoded",
              }
            : {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/sparql-results+json",
              },
      }).then((x) => x.text());
    },
  });
  return [query, execute] as const;
};

const MunicipalityStatus = () => {
  const [query, execute] = useLindasQuery();

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as {
      endpoint: string;
      municipalityName: string;
      municipalityId: string;
    };
    execute({
      mode: "describe",
      endpoint: formData.endpoint,
      sparqlQuery: formData.municipalityName
        ? `
DESCRIBE ?municipality WHERE {
  ?municipality a <https://schema.ld.admin.ch/Municipality>.
  ?municipality <http://schema.org/name> "${formData.municipalityName}".
}`
        : `
DESCRIBE <https://ld.admin.ch/municipality/${formData.municipalityId}>
`,
    });
  };

  const data = query.data;

  const municipalityId = useMemo(() => {
    if (!data) {
      return null;
    }
    const rx = /https:\/\/ld.admin.ch\/municipality\/([0-9]*)/;
    const match = rx.exec(data);
    return match ? match[1] : null;
  }, [data]);

  return (
    <StatusBox>
      <StatusHeading sx={{ mb: 2 }}>Municipality status</StatusHeading>
      <Box fontSize="0.75rem">
        <details>
          <summary>Details</summary>
          <Box
            component="form"
            onSubmit={handleSubmit}
            mt={2}
            sx={{
              "& > * + *": { mt: 0.5, display: "block" },
            }}
          >
            <select name="endpoint">
              <option value="https://int.lindas.admin.ch/query">
                int.lindas.admin.ch
              </option>
              <option value="https://lindas.admin.ch/query">
                lindas.admin.ch
              </option>
            </select>
            <div>Either use municipality name or BFS id</div>
            <label>
              municipality name (exact):{" "}
              <input type="value" name="municipalityName" />
            </label>
            <label>
              municipality BFS id (ex: 261 for Zürich):{" "}
              <input type="value" name="municipalityId" />
            </label>
            <br />
            <button disabled={query.status === "fetching"} type="submit">
              fetch municipality
            </button>
          </Box>
          {query.status === "fetching" ? "Loading...." : ""}
          {query.status === "fetched" ? (
            <Box my={2}>
              {data && municipalityId
                ? `✅ Found municipality id ${municipalityId}`
                : "❌ Could not find municipality"}
            </Box>
          ) : null}
          <details>{data ? <pre>{data}</pre> : null}</details>
          {query.error ? (
            <div>
              Error:{" "}
              {query.error instanceof Error
                ? query.error.message
                : `${query.error}`}
            </div>
          ) : null}
        </details>
      </Box>
    </StatusBox>
  );
};

const SunshineMedianStatus = () => {
  const [query, execute] = useLindasQuery();

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as {
      endpoint: string;
    };
    execute({
      mode: "select",
      endpoint: formData.endpoint,
      sparqlQuery: `
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX cube: <https://cube.link/>
  PREFIX schema: <http://schema.org/>
  PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>

  SELECT * 
  WHERE {
    <https://energy.ld.admin.ch/elcom/sunshine-median> cube:observationSet/cube:observation ?obs . 
    ?obs 
      :group ?group ;
      :period ?period ;
      :gridcost_ne5 ?gridcost_ne5 ;
      :gridcost_ne6 ?gridcost_ne6 ;
      :gridcost_ne7 ?gridcost_ne7 ;
      :franken_regel ?franken_regel ;
      :saidi_total ?saidi_total ;
      :saidi_unplanned ?saidi_unplanned ;
      :saifi_total ?saifi_total ;
      :saifi_unplanned ?saifi_unplanned ;
      :info ?info ;
      :days_in_advance ?days_in_advance ;   
      :in_time ?in_time .
   ?group schema:name ?group_name . FILTER(lang(?group_name) = "de")
  }`,
    });
  };

  return (
    <StatusBox>
      <StatusHeading sx={{ mb: 2 }}>Sunshine Median Status</StatusHeading>
      <Box fontSize="0.75rem">
        <details>
          <summary>Details</summary>
          <Box
            component="form"
            onSubmit={handleSubmit}
            mt={2}
            sx={{
              "& > * + *": { mt: 0.5, display: "block" },
            }}
          >
            <select name="endpoint">
              <option value="https://test.lindas.admin.ch/query">
                test.lindas.admin.ch
              </option>
              <option value="https://int.lindas.admin.ch/query">
                int.lindas.admin.ch
              </option>
              <option value="https://lindas.admin.ch/query">
                lindas.admin.ch
              </option>
            </select>
            <br />
            <button disabled={query.status === "fetching"} type="submit">
              fetch sunshine median data
            </button>
          </Box>
          {query.status === "fetching" ? "Loading...." : ""}
          {query.status === "fetched" ? (
            <Box my={2}>
              {query.data
                ? "✅ Query executed successfully"
                : "❌ No data returned"}
            </Box>
          ) : null}
          <details>
            {query.data ? <SPARQLTable data={JSON.parse(query.data)} /> : null}
          </details>
          {query.error ? (
            <div>
              Error:{" "}
              {query.error instanceof Error
                ? query.error.message
                : `${query.error}`}
            </div>
          ) : null}
        </details>
      </Box>
    </StatusBox>
  );
};

const SPARQLTable = ({
  data,
}: {
  data: {
    head: {
      vars: string[];
    };
    results: {
      bindings: Array<{
        [key: string]: {
          type: string;
          value: string;
        };
      }>;
    };
  };
}) => {
  return (
    <table>
      <thead>
        <tr>
          {data.head.vars.map((varName) => (
            <th key={varName}>{varName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.results.bindings.map((binding, index) => (
          <tr key={index}>
            {data.head.vars.map((varName) => (
              <td key={varName}>{binding[varName]?.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DocumentDownloadStatus = () => {
  const [query, execute] = useManualQuery({
    queryFn: (options: { uid: string; oid: string }) => {
      const searchParams = new URLSearchParams(options);
      return fetch(`/api/debug-download?${searchParams}`).then(
        (x) => x.json() as Promise<{ data: DebugDownloadGetResponse }>
      );
    },
  });

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as {
      uid: string;
      oid: string;
    };
    execute(formData);
  };

  const data = query.data?.data;

  return (
    <StatusBox>
      <StatusHeading sx={{ mb: 2 }}>Document download</StatusHeading>
      <Box fontSize="0.75rem">
        <details>
          <summary>Details</summary>
          <Box
            component="form"
            onSubmit={handleSubmit}
            mt={2}
            sx={{
              "& > * + *": { mt: 0.5, display: "block" },
            }}
          >
            <label>
              Password: <input type="password" name="secret" />
            </label>
            <label>
              OID: <input type="value" name="oid" placeholder="218" />
            </label>
            <br />
            <label>
              UID:{" "}
              <input type="value" name="uid" placeholder="CHE-102.286.322" />
            </label>
            <p style={{ fontSize: "small", color: "#111" }}>
              Either OID or UID is mandatory.
            </p>
            <button disabled={query.status === "fetching"} type="submit">
              fetch documents
            </button>
          </Box>
          {query.status === "fetching" ? "Loading...." : ""}
          {data?.searchResp ? (
            <Box mt={2}>
              <div>
                Lindas endpoint <pre>{JSON.stringify(data.lindasEndpoint)}</pre>
                Lindas query
                <br />
                <textarea cols={100} rows={5}>
                  {data.lindasInfo?.query}
                </textarea>
                <br />
                Lindas data <pre>{JSON.stringify(data.lindasInfo?.data)}</pre>
              </div>
              <div>
                Bindings
                <pre>
                  {JSON.stringify(data.searchResp.debug.bindings, null, 2)}
                </pre>
                <br />
                Search request
                <br />
                <textarea cols={100} rows={30}>
                  {data.searchResp.debug.request}
                </textarea>
                <br />
                Search response
                <br />
                <textarea cols={100} rows={30}>
                  {data.searchResp.debug.response}
                </textarea>
                <br />
              </div>
            </Box>
          ) : null}
          {query.error ? <div>Erreur: {`${query.error}`}</div> : null}
        </details>
      </Box>
    </StatusBox>
  );
};

const serializeOperation = (operation: OperationResult) => {
  return {
    data: operation.data ?? null,
    error: operation.error
      ? {
          message: operation.error.message ?? null,
        }
      : null,
    fetching: false,
    operation: {
      variables: operation.operation.variables,
    },
  };
};

const objectPromiseAllSettled = <
  T extends Record<string, Promise<$IntentionalAny>>
>(
  promises: T
) => {
  const allSettled = Promise.allSettled(Object.values(promises)).then(
    (results) => {
      return Object.fromEntries(
        results.map((result, index) => {
          const key = Object.keys(promises)[index];
          return [key, result];
        })
      );
    }
  );
  return allSettled as Promise<{
    [K in keyof T]: PromiseSettledResult<Awaited<T[K]>>;
  }>;
};

export const getServerSideProps = createGetServerSideProps(
  async (_serverSidePropsCtx, { urqlClient: client, sessionConfig }) => {
    // The code is generic enough here to accomodate for all queries of the page
    // TODO: Put all requests here so that they are executed server side
    const results = await objectPromiseAllSettled({
      cubeHealth: client
        .query<Queries.CubeHealthQuery>(Queries.CubeHealthDocument, {})
        .toPromise(),
      systemInfo: client
        .query<Queries.SystemInfoQuery>(Queries.SystemInfoDocument, {})
        .toPromise(),
      wikiContent: client
        .query<Queries.WikiContentQuery>(Queries.WikiContentDocument, {
          locale: "de",
          slug: "help-price-comparison",
        })
        .toPromise(),
      municipalities: client
        .query<Queries.MunicipalitiesQuery>(Queries.MunicipalitiesDocument, {
          locale: "de",
          ids: ["261", "700"],
          query: "Ber",
        })
        .toPromise(),
      cantons: client
        .query<Queries.CantonsQuery>(Queries.CantonsDocument, {
          locale: "de",
          ids: ["1"],
          query: "Ber",
        })
        .toPromise(),
      operators: client
        .query<Queries.OperatorsQuery>(Queries.OperatorsDocument, {
          locale: "de",
          ids: ["565"],
          query: "lausanne",
        })
        .toPromise(),
      search: client
        .query<Queries.SearchQuery>(Queries.SearchDocument, {
          locale: "de",
          query: "lausanne",
        })
        .toPromise(),
      searchZip: client
        .query<Queries.SearchQuery>(Queries.SearchDocument, {
          locale: "de",
          query: "3000",
        })
        .toPromise(),
      observations: client
        .query<Queries.ObservationsWithAllPriceComponentsQuery>(
          Queries.ObservationsWithAllPriceComponentsDocument,
          {
            locale: "de",
            observationKind: Queries.ObservationKind.Municipality,
            filters: {
              municipality: ["261"],
              period: ["2021"],
              category: ["H4"],
              product: ["standard"],
            },
          }
        )
        .toPromise(),
      cantonMedian: client
        .query<Queries.ObservationsWithAllPriceComponentsQuery>(
          Queries.ObservationsWithAllPriceComponentsDocument,
          {
            locale: "de",
            observationKind: Queries.ObservationKind.Canton,
            filters: {
              canton: ["1", "2"],
              period: ["2021"],
              category: ["H4"],
              product: ["standard"],
            },
          }
        )
        .toPromise(),
      swissMedian: client
        .query<Queries.ObservationsQuery>(Queries.ObservationsDocument, {
          locale: "de",
          observationKind: Queries.ObservationKind.Canton,
          priceComponent: Queries.PriceComponent.Total,
          filters: {
            canton: [],
            period: ["2021"],
            category: ["H4"],
            product: ["standard"],
          },
        })
        .toPromise(),
    });

    if (Object.values(results).some((result) => result.status === "rejected")) {
      throw new Error(
        "FAIL: " +
          JSON.stringify(
            Object.fromEntries(
              Object.entries(results).filter(
                ([_, v]) => v.status === "rejected"
              )
            )
          )
      );
    }

    type Results = typeof results;
    const validResults = results as {
      [K in keyof Results]: Extract<Results[K], { status: "fulfilled" }>;
    };

    return {
      props: {
        defaultEndpoint: defaultSparqlEndpointUrl,
        sessionEndpoint: sessionConfig.flags.sparqlEndpoint,
        cubeHealth: serializeOperation(validResults.cubeHealth.value),
        systemInfo: serializeOperation(validResults.systemInfo.value),
        wikiContent: serializeOperation(validResults.wikiContent.value),
        municipalities: serializeOperation(validResults.municipalities.value),
        cantons: serializeOperation(validResults.cantons.value),
        operators: serializeOperation(validResults.operators.value),
        search: serializeOperation(validResults.search.value),
        searchZip: serializeOperation(validResults.searchZip.value),
        observations: serializeOperation(validResults.observations.value),
        cantonMedian: serializeOperation(validResults.cantonMedian.value),
        swissMedian: serializeOperation(validResults.swissMedian.value),
      },
    };
  }
);

type PageProps = Awaited<
  Extract<
    Awaited<ReturnType<typeof getServerSideProps>>,
    { props: $IntentionalAny }
  >["props"]
>;

export default Page;
