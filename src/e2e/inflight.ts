import { expect, Page, Request } from "@playwright/test";

import { sleep } from "src/e2e/common";

// Simple helper class to track requests
class InflightRequests {
  _page: Page;
  _requests: Set<Request>;
  constructor(page: Page) {
    this._page = page;
    this._requests = new Set();
    this._onStarted = this._onStarted.bind(this);
    this._onFinished = this._onFinished.bind(this);
    this._page.on("request", this._onStarted);
    this._page.on("requestfinished", this._onFinished);
    this._page.on("requestfailed", this._onFinished);
  }

  _onStarted(request: Request) {
    this._requests.add(request);
  }
  _onFinished(request: Request) {
    this._requests.delete(request);
  }

  inflightRequests() {
    return Array.from(this._requests);
  }

  dispose() {
    this._page.removeListener("request", this._onStarted);
    this._page.removeListener("requestfinished", this._onFinished);
    this._page.removeListener("requestfailed", this._onFinished);
  }

  async waitForRequests(options?: {
    type?: string;
    delay?: number;
    fail?: boolean;
  }) {
    const { type, delay = 500 } = options ?? {
      delay: undefined,
      type: undefined,
    };
    // We need a delay to ensure that the requests have started
    await sleep(delay);
    try {
      await expect
        .poll(
          () => {
            const inflightXhrs = this.inflightRequests().filter((request) => {
              if (type === undefined) {
                return true;
              }
              return request.resourceType() === type;
            });

            return inflightXhrs.length;
          },
          {
            timeout: 30_000,
          }
        )
        .toBe(0);
    } catch (e) {
      if (options?.fail !== false) {
        throw e;
      }
    }
  }
}

export default InflightRequests;
