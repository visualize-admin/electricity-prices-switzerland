import { describe, expect, it } from "vitest";

import { messages as catalogDe } from "./de/messages";
import { messages as catalogEn } from "./en/messages";
import { messages as catalogFr } from "./fr/messages";
import { messages as catalogIt } from "./it/messages";

// Extract all URLs from translation files
function extractUrlsFromLocales() {
  const catalogs = {
    de: catalogDe,
    en: catalogEn,
    fr: catalogFr,
    it: catalogIt,
  };

  const urlsByLocale: Record<string, Record<string, string>> = {};

  for (const [locale, catalog] of Object.entries(catalogs)) {
    urlsByLocale[locale] = {};

    for (const [msgid, translation] of Object.entries(catalog)) {
      // Only include keys ending with -url
      if (msgid.endsWith("-url")) {
        const msgstr =
          typeof translation === "string"
            ? translation
            : (translation as { message: string }).message;
        if (msgstr && msgstr.startsWith("http")) {
          urlsByLocale[locale][msgid] = msgstr;
        }
      }
    }
  }

  return urlsByLocale;
}

async function fetchStatus(
  url: string,
  method: "HEAD" | "GET"
): Promise<{ ok: boolean; status: number }> {
  const response = await fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
    headers: {
      "user-agent": "elcom-electricity-price-website-unit-tests",
    },
  });
  return { ok: response.ok, status: response.status };
}

async function verifyUrl(
  url: string
): Promise<{ ok: boolean; status: number }> {
  const attempts = 3;

  for (let attempt = 0; attempt < attempts; attempt++) {
    let result: { ok: boolean; status: number };

    try {
      result = await fetchStatus(url, "HEAD");
      if (!result.ok) {
        result = await fetchStatus(url, "GET");
      }
    } catch {
      try {
        result = await fetchStatus(url, "GET");
      } catch {
        result = { ok: false, status: 0 };
      }
    }

    if (result.ok || (result.status > 0 && result.status < 500)) {
      return result;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    } else {
      return result;
    }
  }

  return { ok: false, status: 0 };
}

describe("Translation URLs validation", () => {
  const urlsByLocale = extractUrlsFromLocales();

  it("should extract URLs from all locale files", () => {
    expect(Object.keys(urlsByLocale)).toHaveLength(4);
    expect(urlsByLocale).toHaveProperty("de");
    expect(urlsByLocale).toHaveProperty("en");
    expect(urlsByLocale).toHaveProperty("fr");
    expect(urlsByLocale).toHaveProperty("it");
  });

  it("should have URLs ending with -url suffix", () => {
    for (const [, urls] of Object.entries(urlsByLocale)) {
      for (const key of Object.keys(urls)) {
        expect(key).toMatch(/-url$/);
      }
    }
  });

  it("should have valid URL format for all extracted URLs", () => {
    for (const [locale, urls] of Object.entries(urlsByLocale)) {
      for (const [key, url] of Object.entries(urls)) {
        expect(url, `${locale}.${key} should be a valid URL`).toMatch(
          /^https?:\/\/.+/
        );
      }
    }
  });

  describe("URL accessibility", () => {
    // Get all unique URLs across all locales
    const allUrls = new Set<string>();
    for (const urls of Object.values(urlsByLocale)) {
      for (const url of Object.values(urls)) {
        allUrls.add(url);
      }
    }

    // Create a test for each unique URL
    for (const url of allUrls) {
      it(`should be accessible: ${url}`, async () => {
        const result = await verifyUrl(url);
        expect(result.ok, `URL ${url} returned status ${result.status}`).toBe(
          true
        );
      });
    }
  });
});
