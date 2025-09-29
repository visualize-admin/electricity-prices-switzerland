import { Client, fetchExchange } from "urql";
import { beforeAll, describe, expect, it } from "vitest";

import {
  SunshineDataByIndicatorDocument,
  type SunshineDataByIndicatorQuery,
  type SunshineDataByIndicatorQueryVariables,
} from "src/graphql/queries";
import { SUNSHINE_DATA_SERVICE_COOKIE_NAME } from "src/lib/sunshine-data-service-context";

const GRAPHQL_BASE_URL =
  process.env.GRAPHQL_BASE_URL || "http://localhost:3000/api/graphql";

const headers = {
  cookie: `${SUNSHINE_DATA_SERVICE_COOKIE_NAME}=sql`,

  ...(process.env.BASIC_AUTH_CREDENTIALS
    ? {
        // basic auth
        authorization: `Basic ${Buffer.from(
          `${process.env.BASIC_AUTH_CREDENTIALS}`
        ).toString("base64")}`,
      }
    : {}),
};

const performHealthCheck = (graphqlEndpoint: string) => {
  return fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ query: "{ __typename }" }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`GraphQL API is not reachable: ${response.statusText}`);
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

const client = new Client({
  url: GRAPHQL_BASE_URL,
  exchanges: [fetchExchange],
  fetchOptions: {
    headers,
  },
});

async function executeGraphQLQuery(
  variables: SunshineDataByIndicatorQueryVariables
): Promise<{ data?: SunshineDataByIndicatorQuery; error?: Error }> {
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
    it("should fetch network costs for C2 NE5 peer group A", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE5",
          peerGroup: "A",
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
                  "operatorUID": "CHE-458.596.026",
                  "period": "2025",
                  "value": 9868.451548,
                },
                {
                  "name": "Dorf- und Elektrokorporation Trübbach",
                  "operatorId": 67,
                  "operatorUID": "CHE-108.963.061",
                  "period": "2025",
                  "value": 40597.86633,
                },
                {
                  "name": "Energie Freiamt AG",
                  "operatorId": 73,
                  "operatorUID": "CHE-108.470.597",
                  "period": "2025",
                  "value": 30451.36646,
                },
              ],
            },
            "sunshineMedianByIndicator": 15548.223885,
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE5 peer group C", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE5",
          peerGroup: "C",
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
                  "name": "Comune Politico di Mesocco, Azienda Elettrica",
                  "operatorId": 21,
                  "operatorUID": "CHE-113.562.420",
                  "period": "2025",
                  "value": 2905.864316,
                },
                {
                  "name": "AZIENDA ELETTRICA DI MASSAGNO (AEM) SA",
                  "operatorId": 28,
                  "operatorUID": "CHE-109.070.415",
                  "period": "2025",
                  "value": 14979.75788,
                },
                {
                  "name": "Elektra Genossenschaft Kaiserstuhl",
                  "operatorId": 149,
                  "operatorUID": "CHE-196.566.964",
                  "period": "2025",
                  "value": 1930.849802,
                },
              ],
            },
            "sunshineMedianByIndicator": 15548.223885,
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE6 peer group C", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE6",
          peerGroup: "C",
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
                  "name": "Comune Politico di Mesocco, Azienda Elettrica",
                  "operatorId": 21,
                  "operatorUID": "CHE-113.562.420",
                  "period": "2025",
                  "value": 3.810086957,
                },
                {
                  "name": "AZIENDA ELETTRICA DI MASSAGNO (AEM) SA",
                  "operatorId": 28,
                  "operatorUID": "CHE-109.070.415",
                  "period": "2025",
                  "value": 12.72177105,
                },
                {
                  "name": "Elektra Genossenschaft Kaiserstuhl",
                  "operatorId": 149,
                  "operatorUID": "CHE-196.566.964",
                  "period": "2025",
                  "value": 8.60052381,
                },
              ],
            },
            "sunshineMedianByIndicator": 8.60052381,
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE7 peer group C", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          peerGroup: "C",
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
                  "name": "Comune Politico di Mesocco, Azienda Elettrica",
                  "operatorId": 21,
                  "operatorUID": "CHE-113.562.420",
                  "period": "2025",
                  "value": 8377.400889,
                },
                {
                  "name": "AZIENDA ELETTRICA DI MASSAGNO (AEM) SA",
                  "operatorId": 28,
                  "operatorUID": "CHE-109.070.415",
                  "period": "2025",
                  "value": 14492.74098,
                },
                {
                  "name": "Elektra Genossenschaft Kaiserstuhl",
                  "operatorId": 149,
                  "operatorUID": "CHE-196.566.964",
                  "period": "2025",
                  "value": 10897.45675,
                },
              ],
            },
            "sunshineMedianByIndicator": 11449.055805,
          },
        }
      `);
    });

    it("should fetch network costs for C2 NE7 peer group D", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "C2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          peerGroup: "D",
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
                  "name": "CKW AG",
                  "operatorId": 37,
                  "operatorUID": "CHE-105.941.235",
                  "period": "2025",
                  "value": 9802.404666,
                },
                {
                  "name": "Energie Kestenholz",
                  "operatorId": 150,
                  "operatorUID": "CHE-115.306.879",
                  "period": "2025",
                  "value": 11612.92708,
                },
                {
                  "name": "Energie Versorgung Riggisberg (EVR) AG",
                  "operatorId": 338,
                  "operatorUID": "CHE-414.229.031",
                  "period": "2025",
                  "value": 13286.853,
                },
              ],
            },
            "sunshineMedianByIndicator": 11449.055805,
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
                  "value": 17600.18439,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 12283.59365,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 12034.61858,
                },
              ],
            },
            "sunshineMedianByIndicator": 11449.055805,
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
                  "value": 11.332443333333332,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 13.999644444444444,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 10.36465,
                },
              ],
            },
            "sunshineMedianByIndicator": 10.68,
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
                  "value": 11.476066666666666,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 14.345883333333331,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 10.517333333333331,
                },
              ],
            },
            "sunshineMedianByIndicator": 10.570666666666668,
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
                  "value": 10.77508,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 11.871535,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 9.517866666666666,
                },
              ],
            },
            "sunshineMedianByIndicator": 9.918,
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
                  "value": null,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 4.4350000000000005,
                },
              ],
            },
            "sunshineMedianByIndicator": 6.573944444444445,
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
                  "value": 14.77256,
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
                  "value": 13.981714285714284,
                },
              ],
            },
            "sunshineMedianByIndicator": 14.579142857142859,
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
                  "value": 17600.18439,
                },
                {
                  "name": "Commune de Courchapoix, electricite",
                  "operatorId": 3,
                  "operatorUID": "CHE-112.591.057",
                  "period": "2025",
                  "value": 12283.59365,
                },
                {
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 12034.61858,
                },
              ],
            },
            "sunshineMedianByIndicator": 11449.055805,
          },
        }
      `);
    });

    it("should fetch network costs for NH2 NE7 peer group B", async () => {
      const variables: SunshineDataByIndicatorQueryVariables = {
        filter: {
          category: "H2",
          indicator: "networkCosts",
          networkLevel: "NE7",
          peerGroup: "B",
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
                  "name": "AEW Energie AG",
                  "operatorId": 5,
                  "operatorUID": "CHE-105.981.944",
                  "period": "2025",
                  "value": 12034.61858,
                },
                {
                  "name": "Commune Mixte de Lamboing, Service Electricité",
                  "operatorId": 42,
                  "operatorUID": "CHE-108.963.782",
                  "period": "2025",
                  "value": 11652.95814,
                },
                {
                  "name": "Primeo Netz AG",
                  "operatorId": 70,
                  "operatorUID": "CHE-109.319.939",
                  "period": "2025",
                  "value": 18081.3344,
                },
              ],
            },
            "sunshineMedianByIndicator": 11449.055805,
          },
        }
      `);
    });
  });
});
