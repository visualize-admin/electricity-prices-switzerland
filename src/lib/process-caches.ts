import { csvExportCache } from "src/lib/csv-export";
import { searchIndexCache } from "src/lib/search-index-cache";
import { coveragesByYearCache } from "src/rdf/coverage-ratio";
import { electricityPriceObservationsCache } from "src/rdf/queries";

export type ProcessCacheId =
  | "csv-export"
  | "coverage-ratio"
  | "electricity-price-observations"
  | "search-index";

export type ProcessCacheInfo = {
  id: ProcessCacheId;
  label: string;
  description: string;
  size: number;
};

const caches: {
  id: ProcessCacheId;
  label: string;
  description: string;
  cache: { clear: () => void; size: number };
}[] = [
  {
    id: "csv-export",
    label: "CSV exports",
    description:
      "Tariff and municipalities CSV dumps. 24h TTL, max 50 entries.",
    cache: csvExportCache,
  },
  {
    id: "coverage-ratio",
    label: "Coverage ratios",
    description: "Operator-municipality coverage by year. 5m TTL.",
    cache: coveragesByYearCache,
  },
  {
    id: "electricity-price-observations",
    label: "Price observations",
    description: "Electricity price SPARQL observations. 60s TTL.",
    cache: electricityPriceObservationsCache,
  },
  {
    id: "search-index",
    label: "Search index",
    description:
      "Municipality / operator / canton search. 15m stale-while-revalidate.",
    cache: searchIndexCache,
  },
];

export const listProcessCaches = (): ProcessCacheInfo[] =>
  caches.map(({ id, label, description, cache }) => ({
    id,
    label,
    description,
    size: cache.size,
  }));

export const clearProcessCache = (id: ProcessCacheId | "all") => {
  if (id === "all") {
    for (const entry of caches) {
      entry.cache.clear();
    }
    return;
  }

  const entry = caches.find((cache) => cache.id === id);
  if (!entry) {
    throw new Error(`Unknown cache: ${id}`);
  }
  entry.cache.clear();
};
