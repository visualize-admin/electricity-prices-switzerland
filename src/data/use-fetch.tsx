import mitt from "mitt";
import { useState, useEffect } from "react";

export type FetchDataState<T> =
  | {
      state: "fetching";
      data: null;
    }
  | {
      state: "error";
      data: null;
      error: unknown;
    }
  | {
      state: "loaded";
      data: T;
    };

type QueryEvents<T> = {
  change: FetchDataState<T>;
};

type QueryCacheEmitter<T = unknown> = ReturnType<typeof mitt<QueryEvents<T>>>;

class QueryCache {
  private cache = new Map<string, unknown>();
  private emitters = new Map<string, QueryCacheEmitter>();

  getState<T>(key: string): FetchDataState<T> {
    return (this.cache.get(key) || {
      state: "fetching",
      data: null,
    }) as FetchDataState<T>;
  }

  setState<T>(key: string, state: FetchDataState<T>): void {
    this.cache.set(key, state);
    this.getEmitter<T>(key).emit("change", state);
  }

  private getEmitter<T>(key: string) {
    if (!this.emitters.has(key)) {
      this.emitters.set(key, mitt<QueryEvents<unknown>>());
    }
    return this.emitters.get(key) as QueryCacheEmitter<T>;
  }

  subscribe<T>(key: string, callback: (state: FetchDataState<T>) => void) {
    const emitter = this.getEmitter<T>(key);
    emitter.on("change", callback);
    return () => {
      emitter.off("change", callback);
    };
  }

  async fetch<T>({
    key,
    queryFn,
  }: {
    key: string;
    queryFn: () => Promise<T>;
  }): Promise<T | null> {
    this.setState<T>(key, { state: "fetching", data: null });
    try {
      const data = await queryFn();
      this.setState<T>(key, { state: "loaded", data });
      return data;
    } catch (e) {
      this.setState<T>(key, { state: "error", error: e, data: null });
      return null;
    }
  }
}

// Singleton instance
export const queryCache = new QueryCache();

export const useFetch = <T,>({
  key,
  queryFn: fetchFn,
}: {
  key: string;
  queryFn: () => Promise<T>;
}): FetchDataState<T> => {
  const [state, setState] = useState<FetchDataState<T>>(
    queryCache.getState<T>(key)
  );

  useEffect(() => {
    const unsubscribe = queryCache.subscribe<T>(key, setState);
    queryCache.fetch<T>({ key, queryFn: fetchFn });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
};
