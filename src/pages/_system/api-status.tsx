import { FormEvent, useCallback, useMemo, useState } from "react";
import { Box, Heading, HeadingProps, BoxProps } from "theme-ui";
import { UseQueryState } from "urql";

import * as Queries from "src/graphql/queries";

import { LoadingIconInline } from "../../components/hint";
import { DebugDownloadGetResponse } from "../api/debug-download";

const IndicatorFail = () => (
  <Box
    sx={{
      display: "inline-block",
      py: 1,
      px: 2,
      borderRadius: "circle",
      bg: "error",
      color: "#fff",
      fontSize: "0.75rem",
      lineHeight: "1rem",
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
      fontSize: "0.75rem",
      lineHeight: "1rem",
    }}
  >
    OK
  </Box>
);

const StatusHeading = ({ children, ...props }: HeadingProps) => {
  return (
    <Heading
      variant="heading3"
      {...props}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        ...props.sx,
      }}
    >
      {children}
    </Heading>
  );
};

const StatusBox = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={{
        py: 2,
        px: 3,
        borderRadius: 3,
        bg: "grey[200]",
        mb: 3,
        borderColor: "grey[400]",
        borderWidth: 1,
        borderStyle: "solid",
        ...props.sx,
      }}
    >
      {props.children}
    </Box>
  );
};

const Status = ({ title, query }: { title: string; query: UseQueryState }) => {
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
        <Box component="span" sx={{ ml: 2, flexGrow: 1 }}>
          {title}
        </Box>
      </StatusHeading>
      {!query.fetching && (
        <>
          <Box sx={{ fontSize: "0.75rem", mt: 2 }}>
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
    </StatusBox>
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
        municipality: ["261"],
        period: ["2021"],
        category: ["H4"],
        product: ["standard"],
      },
    },
  });
  return (
    <Status
      title="Municipality Observations (All Price Components)"
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

const CubeHealth = () => {
  const [query] = Queries.useCubeHealthQuery();

  return <Status title="Cube health" query={query} />;
};

const SectionHeading = (props: HeadingProps) => {
  return (
    <Heading variant="heading2" {...props} sx={{ my: 3, ...props.sx }}>
      {props.children}
    </Heading>
  );
};

const Page = () => {
  return (
    <Box sx={{ p: 5 }}>
      <Heading variant="heading1">API Status</Heading>

      <SectionHeading>Internal</SectionHeading>

      <SystemInfoStatus />

      <WikiContentStatus />

      <Heading variant="heading2" sx={{ mt: 3 }}>
        Data (Lindas)
      </Heading>

      <CubeHealth />

      <ObservationsStatus />

      <CantonMedianStatus />

      <SwissMedianStatus />

      <DocumentDownloadStatus />

      <MunicipalityStatus />

      <SectionHeading>Search</SectionHeading>

      <MunicipalitiesStatus />

      <CantonsStatus />

      <OperatorStatus />

      <SearchStatus />

      <SearchZipStatus />
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
    queryFn: async (options: { endpoint: string; sparqlQuery: string }) => {
      console.log({ options });
      return fetch(options.endpoint, {
        method: "POST",
        body: `query=${encodeURIComponent(options.sparqlQuery)}`,
        headers: {
          Accept: "application/n-triples",
          "Content-Type": "application/x-www-form-urlencoded",
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
    const rx = new RegExp("https://ld.admin.ch/municipality/([0-9]*)");
    const match = rx.exec(data);
    return match ? match[1] : null;
  }, [data]);

  return (
    <StatusBox>
      <StatusHeading sx={{ mb: 2 }}>Municipality status</StatusHeading>
      <Box sx={{ fontSize: "0.75rem" }}>
        <details>
          <summary>Details</summary>
          <Box
            component="form"
            sx={{ mt: 2, "& > * + *": { mt: 0.5, display: "block" } }}
            onSubmit={handleSubmit}
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
            <Box sx={{ my: 2 }}>
              {data && municipalityId
                ? `✅ Found municipality id ${municipalityId}`
                : "❌ Could not find municipality"}
            </Box>
          ) : null}
          <details>{data && data ? <pre>{data}</pre> : null}</details>
          {query.error ? (
            <div>
              Erreur:{" "}
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
      <Box sx={{ fontSize: "0.75rem" }}>
        <details>
          <summary>Details</summary>
          <Box
            component="form"
            sx={{ mt: 2, "& > * + *": { mt: 0.5, display: "block" } }}
            onSubmit={handleSubmit}
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
          {data && data?.searchResp ? (
            <Box sx={{ mt: 2 }}>
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
          {query.error ? <div>Erreur: {query.error}</div> : null}
        </details>
      </Box>
    </StatusBox>
  );
};

export default Page;
