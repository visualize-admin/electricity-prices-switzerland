import {
  csvWarmPeriods,
  logCsvWarmup,
  shouldWarmCsvExports,
} from "src/lib/csv-export";
import { locales } from "src/locales/config";
import { parseLocaleString } from "src/locales/locales";
import {
  defaultSparqlEndpointUrl,
  getDefaultSparqlClient,
} from "src/rdf/sparql-client";

/**
 * Fill tariff + municipalities CSVs for current and previous period so the
 * first user request does not race the 30s federal gateway timeout.
 * Sequential to avoid hammering SPARQL.
 *
 * API route modules are imported lazily: they pull GraphQL/Lingui and must
 * not load inside Next instrumentation (no React → urql `createContext` throws).
 */
export const warmCsvExports = async () => {
  if (!shouldWarmCsvExports()) {
    return;
  }

  const [{ getTariffCsv }, { getMunicipalitiesCsv }] = await Promise.all([
    import("src/pages/api/data-export"),
    import("src/pages/api/municipalities-data.csv"),
  ]);

  const client = getDefaultSparqlClient();
  const periods = csvWarmPeriods();

  for (const period of periods) {
    for (const locale of locales) {
      await logCsvWarmup(`tariff ${period} ${locale}`, () =>
        getTariffCsv(client, period, parseLocaleString(locale))
      );
    }

    await logCsvWarmup(`municipalities ${period}`, () =>
      getMunicipalitiesCsv(defaultSparqlEndpointUrl, Number(period))
    );
  }
};
