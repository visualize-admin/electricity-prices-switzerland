import MiniSearch from "minisearch";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  loadAllCantons,
  loadAllMunicipalities,
  loadAllOperators,
  SearchResult,
} from "src/rdf/search-queries";

export type { SearchResult };
export type SearchType = "municipality" | "canton" | "operator";

type CacheEntry = {
  data: SearchResult[];
  index: MiniSearch;
  builtAt: number;
};

const STALE_AFTER_MS = 15 * 60 * 1000;

// Keyed by `${endpointUrl}:${locale}:${type}`
const cache = new Map<string, CacheEntry>();

const normalizeText = (term: string) =>
  term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function buildIndex(data: SearchResult[]): MiniSearch {
  const idx = new MiniSearch({
    idField: "_key",
    fields: ["name", "postalCodes"],
    storeFields: ["id", "name", "type", "isAbolished", "postalCodes"],
    tokenize: (term) => term.split(/[\s\-:(),]+/),
    processTerm: normalizeText,
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      processTerm: normalizeText,
    },
  });
  idx.addAll(data.map((d) => ({ ...d, _key: `${d.type}:${d.id}` })));
  return idx;
}

async function loadAll(
  locale: string,
  type: SearchType,
  client: ParsingClient,
): Promise<SearchResult[]> {
  switch (type) {
    case "municipality":
      return loadAllMunicipalities({ client });
    case "operator":
      return loadAllOperators({ client });
    case "canton":
      return loadAllCantons({ client, locale });
  }
}

async function buildCacheEntry(
  locale: string,
  type: SearchType,
  client: ParsingClient,
): Promise<CacheEntry> {
  const data = await loadAll(locale, type, client);
  const index = buildIndex(data);
  return { data, index, builtAt: Date.now() };
}

function getEndpointUrl(client: ParsingClient): string {
  return (client.query as $IntentionalAny).endpoint.endpointUrl as string;
}

async function getTypeEntry(
  locale: string,
  type: SearchType,
  client: ParsingClient,
): Promise<CacheEntry> {
  const key = `${getEndpointUrl(client)}:${locale}:${type}`;
  const cached = cache.get(key);

  if (!cached) {
    const entry = await buildCacheEntry(locale, type, client);
    cache.set(key, entry);
    return entry;
  }

  if (Date.now() - cached.builtAt > STALE_AFTER_MS) {
    buildCacheEntry(locale, type, client)
      .then((entry) => cache.set(key, entry))
      .catch(console.error);
  }

  return cached;
}

export async function getSearchIndex(
  locale: string,
  types: SearchType[],
  client: ParsingClient,
): Promise<CacheEntry> {
  if (types.length === 1) {
    return getTypeEntry(locale, types[0], client);
  }

  const entries = await Promise.all(
    types.map((t) => getTypeEntry(locale, t, client)),
  );
  const data = entries.flatMap((e) => e.data);
  const index = buildIndex(data);
  return { data, index, builtAt: Date.now() };
}
