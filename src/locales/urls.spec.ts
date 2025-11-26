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

// Verify a URL is accessible
async function verifyUrl(
  url: string
): Promise<{ ok: boolean; status: number }> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      // Set a timeout
      signal: AbortSignal.timeout(10000),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    // If HEAD fails, try GET (some servers don't support HEAD)
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
      return { ok: response.ok, status: response.status };
    } catch {
      return { ok: false, status: 0 };
    }
  }
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
