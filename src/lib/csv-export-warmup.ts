import {
  csvWarmPeriods,
  logCsvWarmup,
  shouldWarmCsvExports,
} from "src/lib/csv-export";
import { locales } from "src/locales/config";
import { parseLocaleString } from "src/locales/locales";
import { getTariffCsv } from "src/pages/api/data-export";
import { getMunicipalitiesCsv } from "src/pages/api/municipalities-data.csv";
import {
  defaultSparqlEndpointUrl,
  getDefaultSparqlClient,
} from "src/rdf/sparql-client";

/**
 * Fill tariff + municipalities CSVs for current and previous period so the
 * first user request does not race the 30s federal gateway timeout.
 * Sequential to avoid hammering SPARQL.
 */
export const warmCsvExports = async () => {
  if (!shouldWarmCsvExports()) {
    return;
  }

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
