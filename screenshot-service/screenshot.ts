import { either, pipeable } from "fp-ts";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import puppeteer, { Browser } from "puppeteer";
import { Request } from "polka";
import { URL } from "url";
import { ServerResponse } from "http";

/**
 * We start a new browser instance for each request. This may seem a bit expensive (and it is),
 * but gives us a clean browser each time.
 */
async function withBrowser<T>(f: (browser: Browser) => Promise<T>) {
  const browser = await puppeteer.launch({
    dumpio: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--hide-scrollbars",
      "--disable-extensions",
      "--ignore-certificate-errors",
    ],
    ignoreHTTPSErrors: true,
  });

  try {
    return await f(browser);
  } finally {
    // Don't wait for the browser to close. Let this happen asynchronously
    // so we can return the response as soon as possible.
    browser.close();
  }
}

/**
 * We allow to take screenshot of anything that is on the same host.
 */
const isAllowedUrl = (host: undefined | string, url: string) => {
  if (!host) {
    return false;
  } else {
    try {
      const reqHost = new URL(url).host;
      return (
        host === reqHost ||
        reqHost.match(/^localhost/) ||
        host.match(/^localhost/)
      );
    } catch (err) {
      return false;
    }
  }
};

/**
 * The shape of the query params. If the params can not be parsed
 * into this shape we fail the request.
 */
const Query = t.strict({
  url: t.string,
  deviceScaleFactor: t.union([t.undefined, NumberFromString]),
  element: t.union([t.undefined, t.string]),
  filename: t.union([t.undefined, t.string]),
});

export const handleScreenshot = async (req: Request, res: ServerResponse) => {
  try {
    const { status, body, headers } = await pipeable.pipe(
      Query.decode(req.query),
      either.fold(
        /**
         * Decoding the query params failed, return 400.
         */
        async (errors: unknown) => ({
          status: 400,
          body: JSON.stringify({ errors }),
          headers: {
            "Content-Type": "application/json",
          },
        }),
        async (query) => {
          /**
           * Apply the whitelist to the requested url.
           */
          if (!isAllowedUrl(req.headers.host, query.url)) {
            return {
              status: 403,
              body: JSON.stringify({
                error: `URL ${query.url} is not allowed`,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            };
          }

          /*
           * We have a valid request, and can proceed with launching the browser,
           * and capturing the image.
           */
          return withBrowser(async (browser) => {
            const deviceScaleFactor = query.deviceScaleFactor || 1;
            const page = await browser.newPage();
            await page.setViewport({
              width: 1440,
              height: 1024,
              deviceScaleFactor,
            });
            await page.goto(query.url, {
              waitUntil:
                process.env.NODE_ENV === "production" ? "networkidle0" : "load",
              timeout: 120 * 1000,
            });

            const headers: Record<string, string> = {
              "Content-Type": "image/png",
              "Cache-Control":
                "public, max-age=300, s-maxage=300, stale-while-revalidate",
            };
            if (query.filename) {
              headers[
                "Content-Disposition"
              ] = `attachment; filename=${query.filename}.png`;
            }

            if (query.element) {
              /*
               * The request is for a screenshot of a specific element. This element may not
               * exist though. If it doesn't, it's treated as a client error (status 400).
               */
              await page.waitForSelector(`.${query.element}`);

              const elementHandle = await page.$(`#${query.element}`);
              if (!elementHandle) {
                return {
                  status: 400,
                  body: JSON.stringify({
                    error: `Element ${query.element} not found`,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                };
              } else {
                return {
                  status: 200,
                  body: await elementHandle.screenshot({ type: "png" }),
                  headers,
                };
              }
            } else {
              /*
               * Full-page screenshot.
               */
              return {
                status: 200,
                body: await page.screenshot({ type: "png", fullPage: true }),
                headers,
              };
            }
          });
        }
      )
    );

    res.statusCode = status;
    for (const [k, v] of Object.entries(headers)) {
      res.setHeader(k, v);
    }
    res.end(body);
  } catch (error) {
    /*
     * This catches any unhandled exception that happen during processing
     * of the request. These are treated as internal errors (status 500).
     */

    console.error(error); /* tslint:disable-line */

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error }));
  }
};
