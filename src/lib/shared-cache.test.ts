import { describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
let failing = false;

// Minimal stand-in for the ioredis commands the cache uses
vi.mock("src/lib/redis", async (importOriginal) => ({
  ...(await importOriginal<typeof import("src/lib/redis")>()),
  redis: {
    get: async (key: string) => {
      if (failing) throw new Error("ECONNREFUSED");
      return store.get(key) ?? null;
    },
    set: async (key: string, value: string) => {
      store.set(key, value);
    },
    unlink: async (...keys: string[]) => {
      keys.forEach((key) => store.delete(key));
    },
    scanStream: ({ match }: { match: string }) => {
      const prefix = match.replace(/\*$/, "");
      return [[...store.keys()].filter((key) => key.startsWith(prefix))];
    },
  },
}));

const { createSharedCache } = await import("./shared-cache");

describe("createSharedCache with Redis", () => {
  it("round-trips values with Maps", async () => {
    const cache = createSharedCache<{ byId: Map<string, number> }>({
      namespace: "maps",
      ttlMs: 1000,
    });
    await cache.set("a", { byId: new Map([["x", 1]]) });

    expect(await cache.get("a")).toEqual({ byId: new Map([["x", 1]]) });
  });

  it("clears and counts only its own namespace", async () => {
    const one = createSharedCache<string>({ namespace: "one", ttlMs: 1000 });
    const two = createSharedCache<string>({ namespace: "two", ttlMs: 1000 });
    await one.set("a", "1");
    await one.set("b", "1");
    await two.set("a", "2");

    await one.clear();

    expect(await one.size()).toBe(0);
    expect(await one.get("a")).toBeUndefined();
    expect(await two.get("a")).toBe("2");
  });

  it("treats values that do not parse as misses", async () => {
    const cache = createSharedCache<string>({ namespace: "bad", ttlMs: 1000 });
    store.set("cache:bad:a", "{not json");

    expect(await cache.get("a")).toBeUndefined();
  });

  it("treats Redis errors as misses", async () => {
    const cache = createSharedCache<string>({ namespace: "down", ttlMs: 1000 });
    await cache.set("a", "1");
    failing = true;

    expect(await cache.get("a")).toBeUndefined();
    failing = false;
  });
});
