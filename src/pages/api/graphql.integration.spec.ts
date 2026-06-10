import { Client, fetchExchange } from "urql";
import { beforeAll, describe, expect, it } from "vitest";

import { createCookieFromFlags } from "src/admin-auth";
import {
  SunshineDataByIndicatorDocument,
  type SunshineDataByIndicatorQuery,
  type SunshineDataByIndicatorQueryVariables,
} from "src/graphql/queries";
import { LINDAS_ENDPOINTS } from "src/rdf/lindas-endpoints";
import { BASE_URL } from "src/utils/base-url";
import { makeDeploymentAuthHeaders } from "src/utils/integration-headers";

const GRAPHQL_BASE_URL = `${BASE_URL}/api/graphql`;

const makeHeaders = async () => {
  const headers = await makeDeploymentAuthHeaders();
  return {
    ...headers,
    cookie: await createCookieFromFlags({
      sparqlEndpoint: LINDAS_ENDPOINTS.int,
    }),
  };
};

const performHealthCheck = async (graphqlEndpoint: string) => {
  const headers = await makeHeaders();
  return fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ query: "{ __typename }" }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `GraphQL API is not reachable at ${graphqlEndpoint}: ${await response.text()}`,
        );
      }
      return response.json();
    })
    .catch((error) => {
      console.error(
        `Error performing health check (endpoint: ${graphqlEndpoint}):`,
        error,
      );
      throw error;
    });
};

// We need to ensure first that the graphql API is running before executing these tests.
beforeAll(async () => {
  await performHealthCheck(GRAPHQL_BASE_URL);
});

async function executeGraphQLQuery(
  variables: SunshineDataByIndicatorQueryVariables,
): Promise<{ data?: SunshineDataByIndicatorQuery; error?: Error }> {
  const headers = await makeHeaders();
  const client = new Client({
    url: GRAPHQL_BASE_URL,
    exchanges: [fetchExchange],
    fetchOptions: {
      headers,
    },
  });
  const result = await client
    .query(SunshineDataByIndicatorDocument, variables)
    .toPromise();

  return result;
}

/**
 * To write those tests, use the logMiddleware on the graphql API to log the queries and variables.
 * This allows you to then use your favorite LLM to generate the tests based on the
 * logged queries and variables.
 *
 * ## Test Structure
 *
 * it("should fetch network costs for <variables>", async () => {
 *   const variables: SunshineDataByIndicatorQueryVariables = {
 *     filter: <FILTER>,
 *   };
 *
 *   const result = await executeGraphQLQuery(variables);
 *
 *   expect(result.error).toBeUndefined();
 *   expect(result.data).toBeDefined();
 *   expect(formatForSnapshot(result.data)).toMatchInlineSnapshot();
 * })
 *
 * ## Logged queries
 *
 * <Paste the logged queries here>
 */

// Simplify results to that the data is sliced to 10 results
const formatForSnapshot = (data: SunshineDataByIndicatorQuery | undefined) => {
  if (data === undefined) {
    return undefined;
  }
  return {
    data: {
      sunshineDataByIndicator: {
        ...data.sunshineDataByIndicator,
        data: data.sunshineDataByIndicator.data.slice(0, 3),
      },
    },
  };
};

describe("GraphQL API Integration Tests", () => {
  describe("SunshineDataByIndicator queries", () => {
    it("should fetch network costs for C2 NE5 peer group 1", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE5",
          peerGroup: "1",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "die werke versorgung wallisellen ag",
                  "operatorId": 59,
                  "operatorUID": "CHE-109.350.300",
                  "period": "2025",
                  "value": 53936.244,
                },
                {
                  "name": "die werke versorgung wallisellen ag",
                  "operatorId": 59,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/59/referenzid",
                  "period": "2025",
                  "value": 53936.244,
                },
                {
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "CHE-108.961.659",
                  "period": "2025",
                  "value": 14649.07,
                },
              ],
              "median": 15626.765,
            },
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE5 peer group 1", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE5",
          peerGroup: "1",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "die werke versorgung wallisellen ag",
                  "operatorId": 59,
                  "operatorUID": "CHE-109.350.300",
                  "period": "2025",
                  "value": 53936.244,
                },
                {
                  "name": "die werke versorgung wallisellen ag",
                  "operatorId": 59,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/59/referenzid",
                  "period": "2025",
                  "value": 53936.244,
                },
                {
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "CHE-108.961.659",
                  "period": "2025",
                  "value": 14649.07,
                },
              ],
              "median": 15626.765,
            },
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE6 peer group 1", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE6",
          peerGroup: "1",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "die werke versorgung wallisellen ag",
                  "operatorId": 59,
                  "operatorUID": "CHE-109.350.300",
                  "period": "2025",
                  "value": 4.106,
                },
                {
                  "name": "die werke versorgung wallisellen ag",
                  "operatorId": 59,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/59/referenzid",
                  "period": "2025",
                  "value": 4.106,
                },
                {
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "CHE-108.961.659",
                  "period": "2025",
                  "value": 6.555,
                },
              ],
              "median": 9.211,
            },
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE7 peer group 2", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          peerGroup: "2",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "Elektrogenossenschaft Moos-Dieselbach",
                  "operatorId": 263,
                  "operatorUID": "CHE-101.671.752",
                  "period": "2025",
                  "value": 4233.642,
                },
                {
                  "name": "Elektrogenossenschaft Moos-Dieselbach",
                  "operatorId": 263,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/263/referenzid",
                  "period": "2025",
                  "value": 4233.642,
                },
                {
                  "name": "Elektra-Genossenschaft Siglistorf-Wislikofen-Mellstorf",
                  "operatorId": 280,
                  "operatorUID": "CHE-309.184.729",
                  "period": "2025",
                  "value": 6716.825,
                },
              ],
              "median": 12556.643,
            },
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE7 peer group 2", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          peerGroup: "2",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "Elektrogenossenschaft Moos-Dieselbach",
                  "operatorId": 263,
                  "operatorUID": "CHE-101.671.752",
                  "period": "2025",
                  "value": 4233.642,
                },
                {
                  "name": "Elektrogenossenschaft Moos-Dieselbach",
                  "operatorId": 263,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/263/referenzid",
                  "period": "2025",
                  "value": 4233.642,
                },
                {
                  "name": "Elektra-Genossenschaft Siglistorf-Wislikofen-Mellstorf",
                  "operatorId": 280,
                  "operatorUID": "CHE-309.184.729",
                  "period": "2025",
                  "value": 6716.825,
                },
              ],
              "median": 12556.643,
            },
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE7 without peer group", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 15046.575,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 15046.575,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 12283.594,
                },
              ],
              "median": 12556.643,
            },
          },
        }
      `);
    });

    it("should fetch net tariffs for C2 NE7", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "netTariffs",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 11.332,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 11.332,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 14,
                },
              ],
              "median": 11.26,
            },
          },
        }
      `);
    });

    it("should fetch net tariffs for NC3 NE7", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C3",
          indicator: "netTariffs",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 11.476,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 11.476,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 14.346,
                },
              ],
              "median": 10.517,
            },
          },
        }
      `);
    });

    it("should fetch net tariffs for NC4 NE7", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C4",
          indicator: "netTariffs",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 10.775,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 10.775,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 11.872,
                },
              ],
              "median": 9.661,
            },
          },
        }
      `);
    });

    it("should fetch net tariffs for NC6 NE7", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C6",
          indicator: "netTariffs",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 8.117,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 8.117,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 0,
                },
              ],
              "median": 6.011,
            },
          },
        }
      `);
    });

    it("should fetch net tariffs for NH2 NE7", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "H2",
          indicator: "netTariffs",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 14.773,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 14.773,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 21.02,
                },
              ],
              "median": 13.883,
            },
          },
        }
      `);
    });

    it("should fetch network costs for NH2 NE7", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "H2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 15046.575,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 15046.575,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 12283.594,
                },
              ],
              "median": 12556.643,
            },
          },
        }
      `);
    });

    it("should fetch network costs for NH2 NE7 peer group 4", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "H2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          peerGroup: "4",
          period: "2025",
          saidiSaifiType: "total",
        },
      };

      const result = await executeGraphQLQuery(variables);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(formatForSnapshot(result.data)).toMatchInlineSnapshot(`
        {
          "data": {
            "sunshineDataByIndicator": {
              "data": [
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "CHE-108.955.110",
                  "period": "2025",
                  "value": 15046.575,
                },
                {
                  "name": "AGE SA",
                  "operatorId": 2,
                  "operatorUID": "https://energy.ld.admin.ch/elcom/electricityprice/operator/2/referenzid",
                  "period": "2025",
                  "value": 15046.575,
                },
                {
                  "name": "Aare Versorgungs AG (AVAG)",
                  "operatorId": 11,
                  "operatorUID": "CHE-106.844.310",
                  "period": "2025",
                  "value": 9145.362,
                },
              ],
              "median": 12556.643,
            },
          },
        }
      `);
    });
  });
});
