import { Client, fetchExchange } from "urql";
import { beforeAll, describe, expect, it } from "vitest";

import { createCookieFromFlags } from "src/admin-auth";
import {
  SunshineDataByIndicatorDocument,
  type SunshineDataByIndicatorQuery,
  type SunshineDataByIndicatorQueryVariables,
} from "src/graphql/queries";

const GRAPHQL_BASE_URL =
  process.env.GRAPHQL_BASE_URL || "http://localhost:3000/api/graphql";

const makeHeaders = async () => ({
  cookie: await createCookieFromFlags({
    sparqlEndpoint: "https://int.lindas.admin.ch/query",
  }),

  ...(process.env.BASIC_AUTH_CREDENTIALS
    ? {
        // basic auth
        authorization: `Basic ${Buffer.from(
          `${process.env.BASIC_AUTH_CREDENTIALS}`
        ).toString("base64")}`,
      }
    : {}),
});

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
          `GraphQL API is not reachable at ${graphqlEndpoint}: ${await response.text()}`
        );
      }
      return response.json();
    })
    .catch((error) => {
      console.error(
        `Error performing health check (endpoint: ${graphqlEndpoint}):`,
        error
      );
      throw error;
    });
};

// We need to ensure first that the graphql API is running before executing these tests.
beforeAll(async () => {
  await performHealthCheck(GRAPHQL_BASE_URL);
});

async function executeGraphQLQuery(
  variables: SunshineDataByIndicatorQueryVariables
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
      sunshineMedianByIndicator: data.sunshineMedianByIndicator,
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
                  "name": "Wasser- und Elektrizitätswerk Steinhausen AG",
                  "operatorId": 11828,
                  "operatorUID": "11828",
                  "period": "2025",
                  "value": 18386.237,
                },
                {
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "304",
                  "period": "2025",
                  "value": 14649.07,
                },
                {
                  "name": "Energie Opfikon AG",
                  "operatorId": 508,
                  "operatorUID": "508",
                  "period": "2025",
                  "value": 55635.128,
                },
              ],
            },
            "sunshineMedianByIndicator": 15650.214,
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
                  "name": "Wasser- und Elektrizitätswerk Steinhausen AG",
                  "operatorId": 11828,
                  "operatorUID": "11828",
                  "period": "2025",
                  "value": 18386.237,
                },
                {
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "304",
                  "period": "2025",
                  "value": 14649.07,
                },
                {
                  "name": "Energie Opfikon AG",
                  "operatorId": 508,
                  "operatorUID": "508",
                  "period": "2025",
                  "value": 55635.128,
                },
              ],
            },
            "sunshineMedianByIndicator": 15650.214,
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
                  "name": "Wasser- und Elektrizitätswerk Steinhausen AG",
                  "operatorId": 11828,
                  "operatorUID": "11828",
                  "period": "2025",
                  "value": 7.896,
                },
                {
                  "name": "Politische Gemeinde Rickenbach TG Elektrizitätsversorgung",
                  "operatorId": 304,
                  "operatorUID": "304",
                  "period": "2025",
                  "value": 6.555,
                },
                {
                  "name": "Energie Opfikon AG",
                  "operatorId": 508,
                  "operatorUID": "508",
                  "period": "2025",
                  "value": 6.725,
                },
              ],
            },
            "sunshineMedianByIndicator": 8.935,
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
                  "operatorUID": "263",
                  "period": "2025",
                  "value": 4233.642,
                },
                {
                  "name": "Elektra-Genossenschaft Siglistorf-Wislikofen-Mellstorf",
                  "operatorId": 280,
                  "operatorUID": "280",
                  "period": "2025",
                  "value": 6716.825,
                },
                {
                  "name": "Politische Gemeinde Fällanden, Wasser, Abwasser, Strom",
                  "operatorId": 432,
                  "operatorUID": "432",
                  "period": "2025",
                  "value": 14736.286,
                },
              ],
            },
            "sunshineMedianByIndicator": 12556.643,
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
                  "operatorUID": "263",
                  "period": "2025",
                  "value": 4233.642,
                },
                {
                  "name": "Elektra-Genossenschaft Siglistorf-Wislikofen-Mellstorf",
                  "operatorId": 280,
                  "operatorUID": "280",
                  "period": "2025",
                  "value": 6716.825,
                },
                {
                  "name": "Politische Gemeinde Fällanden, Wasser, Abwasser, Strom",
                  "operatorId": 432,
                  "operatorUID": "432",
                  "period": "2025",
                  "value": 14736.286,
                },
              ],
            },
            "sunshineMedianByIndicator": 12556.643,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 12858.57,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 11059.218,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 13815.621,
                },
              ],
            },
            "sunshineMedianByIndicator": 12556.643,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 11.052,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 14.26,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 0,
                },
              ],
            },
            "sunshineMedianByIndicator": 11.26,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 8.807,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 14.02,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 10.455,
                },
              ],
            },
            "sunshineMedianByIndicator": 10.517,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 8.284,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 13.352,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 10.017,
                },
              ],
            },
            "sunshineMedianByIndicator": 9.767,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 8.326,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 0,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 0,
                },
              ],
            },
            "sunshineMedianByIndicator": 6.175,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 16.123,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 19.54,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 15.773,
                },
              ],
            },
            "sunshineMedianByIndicator": 13.96,
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
                  "name": "Arosa Energie",
                  "operatorId": 10,
                  "operatorUID": "10",
                  "period": "2025",
                  "value": 12858.57,
                },
                {
                  "name": "ELEKTRA ENERGIE Genossenschaft",
                  "operatorId": 105,
                  "operatorUID": "105",
                  "period": "2025",
                  "value": 11059.218,
                },
                {
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 13815.621,
                },
              ],
            },
            "sunshineMedianByIndicator": 12556.643,
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
                  "name": "Elektra Andwil Stromversorgung",
                  "operatorId": 107,
                  "operatorUID": "107",
                  "period": "2025",
                  "value": 13815.621,
                },
                {
                  "name": "Monthey Energies SA",
                  "operatorId": 10839,
                  "operatorUID": "10839",
                  "period": "2025",
                  "value": 12058.984,
                },
                {
                  "name": "Aare Versorgungs AG (AVAG)",
                  "operatorId": 11,
                  "operatorUID": "11",
                  "period": "2025",
                  "value": 9145.362,
                },
              ],
            },
            "sunshineMedianByIndicator": 12556.643,
          },
        }
      `);
    });
  });
});
