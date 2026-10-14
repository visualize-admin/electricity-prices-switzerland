import { csvExportCache } from "src/lib/csv-export";
import { searchIndexCache } from "src/lib/search-index-cache";
import { SharedCache } from "src/lib/shared-cache";
import { coveragesByYearCache } from "src/rdf/coverage-ratio";
import { municipalityLookupCache } from "src/rdf/queries";

const sharedCaches: SharedCache<unknown>[] = [
  csvExportCache,
  coveragesByYearCache,
  municipalityLookupCache,
];

/** The shared caches, plus the search index, which is in-memory only */
export const listProcessCaches = async () => ({
  sharedCaches: await Promise.all(
    sharedCaches.map(async (cache) => ({
      namespace: cache.namespace,
      backend: cache.backend,
      size: await cache.size(),
    }))
  ),
  searchIndexSize: searchIndexCache.size,
});

/** Clears a shared cache by namespace, the search index, or all of them */
export const clearProcessCache = async (id: string) => {
  if (id === "all") {
    searchIndexCache.clear();
    await Promise.all(sharedCaches.map((cache) => cache.clear()));
    return;
  }
  if (id === "search-index") {
    searchIndexCache.clear();
    return;
  }

  const cache = sharedCaches.find((cache) => cache.namespace === id);
  if (!cache) {
    throw new Error(`Unknown cache: ${id}`);
  }
  await cache.clear();
};
