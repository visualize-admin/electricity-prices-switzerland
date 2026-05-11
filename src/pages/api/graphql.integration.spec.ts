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
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "CHE-108.961.659",
                  "period": "2025",
                  "value": 14649.07,
                },
                {
                  "name": "Energie Opfikon AG",
                  "operatorId": 508,
                  "operatorUID": "CHE-109.691.468",
                  "period": "2025",
                  "value": 55635.128,
                },
              ],
              "median": 15650.214,
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
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "CHE-108.961.659",
                  "period": "2025",
                  "value": 14649.07,
                },
                {
                  "name": "Energie Opfikon AG",
                  "operatorId": 508,
                  "operatorUID": "CHE-109.691.468",
                  "period": "2025",
                  "value": 55635.128,
                },
              ],
              "median": 15650.214,
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
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "CHE-108.961.659",
                  "period": "2025",
                  "value": 6.555,
                },
                {
                  "name": "Energie Opfikon AG",
                  "operatorId": 508,
                  "operatorUID": "CHE-109.691.468",
                  "period": "2025",
                  "value": 6.725,
                },
              ],
              "median": 8.935,
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
                  "name": "Elektra-Genossenschaft Siglistorf-Wislikofen-Mellstorf",
                  "operatorId": 280,
                  "operatorUID": "CHE-309.184.729",
                  "period": "2025",
                  "value": 6716.825,
                },
                {
                  "name": "Politische Gemeinde Fällanden, Wasser, Abwasser, Strom",
                  "operatorId": 432,
                  "operatorUID": "CHE-112.544.112",
                  "period": "2025",
                  "value": 14736.286,
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
                  "name": "Elektra-Genossenschaft Siglistorf-Wislikofen-Mellstorf",
                  "operatorId": 280,
                  "operatorUID": "CHE-309.184.729",
                  "period": "2025",
                  "value": 6716.825,
                },
                {
                  "name": "Politische Gemeinde Fällanden, Wasser, Abwasser, Strom",
                  "operatorId": 432,
                  "operatorUID": "CHE-112.544.112",
                  "period": "2025",
                  "value": 14736.286,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 12283.594,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 11766.001,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 14,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 10.365,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 14.346,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 10.517,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 11.872,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 9.518,
                },
              ],
              "median": 9.697,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 0,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 4.435,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 21.02,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 13.982,
                },
              ],
              "median": 13.96,
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
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 12283.594,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 11766.001,
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
                  "name": "Aare Versorgungs AG (AVAG)",
                  "operatorId": 11,
                  "operatorUID": "CHE-106.844.310",
                  "period": "2025",
                  "value": 9145.362,
                },
                {
                  "name": "AZIENDA ELETTRICA DI MASSAGNO (AEM) SA",
                  "operatorId": 28,
                  "operatorUID": "CHE-109.070.415",
                  "period": "2025",
                  "value": 7657.544,
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
