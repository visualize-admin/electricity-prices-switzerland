import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { NetworkLevel } from "src/domain/sunshine";
import * as ns from "src/rdf/namespace";

export const DEFAULT_COVERAGE_NETWORK_LEVEL = "NE7";

/**
 * Under this threshold, observations are not returned
 */
const COVERAGE_RATIO_THRESHOLD = 0.25;

/**
 * The coverage ratios for operators for each year are cached for 5m
 */
const coveragesByYearCache = new LRUCache<string, Promise<Map<string, number>>>(
  {
    entryExpirationTimeInMS: 5 * 60 * 1000,
  }
);

const coverageRatioKey = (
  municipalityId: string,
  networkLevel: string,
  operator: string
) => {
  return `coverage-${municipalityId}-${networkLevel}-${operator}`;
};

const muniCountKey = (municipalityId: string) => {
  return `count-${municipalityId}`;
};

const muniNetworkCountKey = (municipalityId: string, networkLevel: string) => {
  return `count-${municipalityId}-${networkLevel}`;
};

const cacheCoverageRatios = async (
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
        const muniNetK = muniNetworkCountKey(municipalityId, networkLevel);
        const muniK = muniCountKey(municipalityId);
        coverageMap.set(muniNetK, (coverageMap.get(muniNetK) ?? 0) + 1);
        coverageMap.set(muniK, (coverageMap.get(muniK) ?? 0) + 1);

        const operator = ns.stripNamespaceFromIri({
          iri: result.operator.value,
        });
        const key = coverageRatioKey(municipalityId, networkLevel, operator);
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

  /**
   * Filters items based on coverage ratio threshold.
   *
   * @param items - Array of items to filter
   * @param coverageAccessor - Function to extract coverage ratio from each item
   * @returns Filtered array with items that meet the coverage threshold
   */
  static filterByCoverageRatio<T>(
    items: T[],
    coverageAccessor: (item: T) => number | undefined
  ): T[] {
    return items.filter((item) => {
      const coverageRatio = coverageAccessor(item);
      return (
        coverageRatio !== undefined && coverageRatio >= COVERAGE_RATIO_THRESHOLD
      );
    });
  }

  async prepare(years: string[]) {
    const coveragePromises = years.map(async (year) => {
      const coverage = await cacheCoverageRatios(this.sparqlClient, year);
      return [year, coverage] as const;
    });
    this.coverageCachesByYear = Object.fromEntries(
      await Promise.all(coveragePromises)
    );
  }

  logMunicipalityValues(municipalityId: string) {
    for (const [year, cache] of Object.entries(this.coverageCachesByYear)) {
      const keys = Array.from(cache.keys()).filter(
        (k) =>
          k.startsWith(`coverage-${municipalityId}-`) ||
          k.startsWith(`count-${municipalityId}`)
      );
      if (keys.length === 0) {
        // eslint-disable-next-line no-console
        console.log(`No keys for municipality id ${municipalityId}`);
      }
      for (const key of keys) {
        // eslint-disable-next-line no-console
        console.log(`${key} - ${year}: ${cache.get(key)}`);
      }
    }
  }

  /**
   * Get the coverage ratio for a specific observation and network level.
   *
   * Warning: The cache for the specific year must have been prepared before calling this method.
   */
  getCoverage(
    observation: {
      period?: string | undefined;
      municipality?: string | undefined;
      operator?: string | undefined;
    },
    networkLevel: NetworkLevel["id"] = DEFAULT_COVERAGE_NETWORK_LEVEL
  ) {
    const { period, municipality, operator } = observation;
    if (period === undefined) {
      // Should not happen
      return 0;
    }
    const yearCache = this.coverageCachesByYear[period!];
    if (!yearCache || !municipality || !operator) {
      // Should not happen
      return 0;
    }

    const cacheKey = coverageRatioKey(municipality, networkLevel, operator);
    const cached = yearCache.get(cacheKey);
    if (cached === undefined) {
      if (yearCache.get(muniNetworkCountKey(municipality, networkLevel))) {
        // We have no coverage data for this operator but we have
        // data for other operators at the same municipality & network level,
        // we default to 0
        return 0;
      } else {
        // We have no coverage ratios for this network level
        // at all for this municipality, then we default to 1
        return 1;
      }
    } else {
      return cached;
    }
  }
}
