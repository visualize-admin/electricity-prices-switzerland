import { Box, Chip, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import React from "react";
import { UseQueryState } from "urql";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { LoadingIconInline } from "src/components/hint";
import * as Queries from "src/graphql/queries";
import { contextFromGetServerSidePropsContext } from "src/graphql/server-context";
import { apolloServer } from "src/pages/api/graphql";
import { defaultSparqlEndpointUrl } from "src/rdf/sparql-client";
import {
  createExecuteGraphqlQuery,
  ExecuteGraphqlQuery,
} from "src/utils/execute-graphql-query";

type QueryProp = Pick<UseQueryState, "fetching" | "data"> & {
  error?: { message: string } | null;
  operation?: { variables: Record<string, unknown> } | null;
};

const StatusRow = ({ title, query }: { title: string; query: QueryProp }) => {
  return (
    <Box py={2} borderBottom={1} borderColor="divider">
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        {query.fetching ? (
          <LoadingIconInline size={20} />
        ) : query.error ? (
          <Chip label="FAIL" color="error" />
        ) : (
          <Chip label="OK" color="success" />
        )}
        <Typography variant="body1" fontWeight={500}>
          {title}
        </Typography>
      </Box>
      {!query.fetching && (
        <Box fontSize="0.75rem" color="text.secondary">
          <details>
            <summary style={{ cursor: "pointer" }}>Details</summary>
            <Box mt={1}>
              {query.operation?.variables && (
                <pre style={{ margin: "4px 0" }}>
                  Variables:{" "}
                  {JSON.stringify(query.operation.variables, null, 2)}
                </pre>
              )}
              {query.error && (
                <pre style={{ margin: "4px 0", color: "red" }}>
                  Error: {JSON.stringify(query.error, null, 2)}
                </pre>
              )}
              {query.data && (
                <pre style={{ margin: "4px 0" }}>
                  Data: {JSON.stringify(query.data, null, 2)}
                </pre>
              )}
            </Box>
          </details>
        </Box>
      )}
    </Box>
  );
};

interface Props {
  csrfToken: string;
  defaultEndpoint: string;
  cubeHealth: QueryProp;
  systemInfo: QueryProp;
  wikiContent: QueryProp;
  municipalities: QueryProp;
  cantons: QueryProp;
  operators: QueryProp;
  search: QueryProp;
  searchZip: QueryProp;
  observations: QueryProp;
  cantonMedian: QueryProp;
  swissMedian: QueryProp;
}

export default function ApiStatusPage({
  csrfToken,
  defaultEndpoint,
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
}: Props) {
  return (
    <AdminLayout
      title="API Status"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "API Status" }]}
    >
      <Typography variant="body2" color="text.secondary" mb={4}>
        Default SPARQL endpoint: <code>{defaultEndpoint}</code>
      </Typography>

      <Box mb={5}>
        <Typography variant="h5" mb={2}>
          Internal
        </Typography>
        <StatusRow title="System API" query={systemInfo} />
        <StatusRow title="Content API" query={wikiContent} />
      </Box>

      <Box mb={5}>
        <Typography variant="h5" mb={2}>
          Data (Lindas)
        </Typography>
        <StatusRow title="Cube health" query={cubeHealth} />
        <StatusRow
          title="Municipality Observations (All Price Components)"
          query={observations}
        />
        <StatusRow
          title="Canton Median Observations (All Price Components)"
          query={cantonMedian}
        />
        <StatusRow title="Swiss Median Observations" query={swissMedian} />
      </Box>

      <Box mb={5}>
        <Typography variant="h5" mb={2}>
          Search
        </Typography>
        <StatusRow title="Municipalities (ID + Query)" query={municipalities} />
        <StatusRow title="Cantons (ID + Query)" query={cantons} />
        <StatusRow title="Operators (ID + Query)" query={operators} />
        <StatusRow title="Search (Query)" query={search} />
        <StatusRow title="Search (PLZ)" query={searchZip} />
      </Box>
    </AdminLayout>
  );
}

const executeQuerySafe = async <T,>(
  executeGraphqlQuery: ExecuteGraphqlQuery,
  document: $IntentionalAny,
  variables: Record<string, $IntentionalAny>,
): Promise<
  | { data: T; variables: typeof variables }
  | { error: Error; variables: typeof variables }
> => {
  try {
    const data = await executeGraphqlQuery<T>(document, variables);
    return { data, variables };
  } catch (error) {
    return { error: error as Error, variables };
  }
};

const serializeQueryResult = <T,>(
  result:
    | { data: T; variables: Record<string, $IntentionalAny> }
    | { error: Error; variables: Record<string, $IntentionalAny> },
): QueryProp => {
  if ("error" in result) {
    return {
      data: null,
      error: { message: result.error.message },
      fetching: false,
      operation: { variables: result.variables },
    };
  }
  return {
    data: result.data,
    error: null,
    fetching: false,
    operation: { variables: result.variables },
  };
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const session = await parseSessionFromRequest(context.req);
  if (!session) {
    return {
      redirect: {
        destination: "/admin/login?return_to=/admin/api-status",
        permanent: false,
      },
    };
  }

  const csrfToken = generateCSRFToken(session.sessionId);
  const graphqlContext = await contextFromGetServerSidePropsContext(context);
  const executeGraphqlQuery =
    createExecuteGraphqlQuery(apolloServer)(graphqlContext);

  const [
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
  ] = await Promise.all([
    executeQuerySafe<Queries.CubeHealthQuery>(
      executeGraphqlQuery,
      Queries.CubeHealthDocument,
      {},
    ),
    executeQuerySafe<Queries.SystemInfoQuery>(
      executeGraphqlQuery,
      Queries.SystemInfoDocument,
      {},
    ),
    executeQuerySafe<Queries.WikiContentQuery>(
      executeGraphqlQuery,
      Queries.WikiContentDocument,
      { locale: "de", slug: "help-price-comparison" },
    ),
    executeQuerySafe<Queries.MunicipalitiesQuery>(
      executeGraphqlQuery,
      Queries.MunicipalitiesDocument,
      { locale: "de", ids: ["261", "700"], query: "Ber" },
    ),
    executeQuerySafe<Queries.CantonsQuery>(
      executeGraphqlQuery,
      Queries.CantonsDocument,
      { locale: "de", ids: ["1"], query: "Ber" },
    ),
    executeQuerySafe<Queries.OperatorsQuery>(
      executeGraphqlQuery,
      Queries.OperatorsDocument,
      { locale: "de", ids: ["565"], query: "lausanne" },
    ),
    executeQuerySafe<Queries.SearchQuery>(
      executeGraphqlQuery,
      Queries.SearchDocument,
      { locale: "de", query: "lausanne" },
    ),
    executeQuerySafe<Queries.SearchQuery>(
      executeGraphqlQuery,
      Queries.SearchDocument,
      { locale: "de", query: "3000" },
    ),
    executeQuerySafe<Queries.ObservationsWithAllPriceComponentsQuery>(
      executeGraphqlQuery,
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
      },
    ),
    executeQuerySafe<Queries.ObservationsWithAllPriceComponentsQuery>(
      executeGraphqlQuery,
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
      },
    ),
    executeQuerySafe<Queries.ObservationsQuery>(
      executeGraphqlQuery,
      Queries.ObservationsDocument,
      {
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
    ),
  ]);

  return {
    props: {
      csrfToken,
      defaultEndpoint: defaultSparqlEndpointUrl,
      cubeHealth: serializeQueryResult(cubeHealth),
      systemInfo: serializeQueryResult(systemInfo),
      wikiContent: serializeQueryResult(wikiContent),
      municipalities: serializeQueryResult(municipalities),
      cantons: serializeQueryResult(cantons),
      operators: serializeQueryResult(operators),
      search: serializeQueryResult(search),
      searchZip: serializeQueryResult(searchZip),
      observations: serializeQueryResult(observations),
      cantonMedian: serializeQueryResult(cantonMedian),
      swissMedian: serializeQueryResult(swissMedian),
    },
  };
};
