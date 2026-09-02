import type { Page } from "@playwright/test";

/**
 * document.scrollWidth only grows past clientWidth when something actually
 * pushes the page's own scrollable box wider — content clipped by an
 * overflow-hidden/auto ancestor (chart SVGs, scrollable chip rows) doesn't
 * count, so this doesn't need per-element exclusions the way a naive
 * getBoundingClientRect sweep would.
 */
export async function measureHorizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
}
