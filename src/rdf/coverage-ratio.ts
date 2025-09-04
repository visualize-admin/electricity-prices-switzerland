import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import * as ns from "src/rdf/namespace";

const coveragesByYearCache = new LRUCache<string, Promise<Map<string, number>>>(
  {
    entryExpirationTimeInMS: 60 * 1000,
  }
);

const getCoverageRatioKey = (
  municipalityId: string,
  networkLevel: string,
  operator: string
) => {
  return `coverage-${municipalityId}-${networkLevel}-${operator}`;
};

const getCoverageRatios = async (
  client: ParsingClient,
  year: string
): Promise<Map<string, number>> => {
  const cacheKey = `coverage-ratios-${year}`;

  const cached = coveragesByYearCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const query = `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
PREFIX : <https://energy.ld.admin.ch/elcom/electricityprice/>

SELECT ?municipality ?networkLevel ?coverageRatio ?operator
FROM <https://lindas.admin.ch/elcom/electricityprice>
WHERE {
    ?offer a schema:Offer; 
        schema:temporalCoverage "${year}"^^xsd:gYear ;
        schema:areaServed ?municipality ;
        :coverageRatio ?coverageRatio ;
        schema:offeredBy ?operator;
        :networkLevel ?networkLevel .

        # Only get non default coverage ratio
        FILTER(?coverageRatio < 1)
}
ORDER BY ?municipality ?networkLevel
    `;

  const promise = client.query
    .select(query)
    .then((results: $IntentionalAny[]) => {
      const coverageMap = new Map<string, number>();

      results.forEach((result) => {
        const municipalityId = ns.stripNamespaceFromIri({
          iri: result.municipality.value,
        });
        const networkLevel = ns.stripNamespaceFromIri({
          iri: result.networkLevel.value,
        });
        const operator = ns.stripNamespaceFromIri({
          iri: result.operator.value,
        });
        const key = getCoverageRatioKey(municipalityId, networkLevel, operator);
        coverageMap.set(key, parseFloat(result.coverageRatio.value));
      });

      return coverageMap;
    });

  coveragesByYearCache.set(cacheKey, promise);
  return promise;
};

/**
 * Class to manage coverage ratio caches for different years.
 */
export class CoverageCacheManager {
  private coverageCachesByYear: Record<string, Map<string, number>> = {};
  private sparqlClient: ParsingClient;

  constructor(client: ParsingClient) {
    this.sparqlClient = client;
  }

  async prepare(years: string[]) {
    const coveragePromises = years.map(async (year) => {
      const coverage = await getCoverageRatios(this.sparqlClient, year);
      return [year, coverage] as const;
    });
    this.coverageCachesByYear = Object.fromEntries(
      await Promise.all(coveragePromises)
    );
  }

  /**
   * Get the coverage ratio for a specific observation and network level.
   *
   * Warning: The cache for the specific year must have been prepared before calling this method.
   */
  getCoverage(
    observation: {
      period: string;
      municipality: string | undefined;
      operator: string | undefined;
    },
    networkLevel = "NE7"
  ) {
    const { period, municipality, operator } = observation;
    const yearCache = this.coverageCachesByYear[period!];
    if (!yearCache || !municipality || !operator) {
      return undefined;
    }

    const cacheKey = getCoverageRatioKey(municipality, networkLevel, operator);
    return yearCache.get(cacheKey);
  }
}
