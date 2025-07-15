import { useRouter } from "next/router";
import { useCallback } from "react";
import * as z from "zod";

const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

export type UseQueryStateSingle<T extends z.ZodRawShape> = {
  [K in keyof T]: z.infer<T[K]>;
};

type UseRouter = typeof useRouter;

type UseQueryStateOptions<T extends z.ZodRawShape> = {
  router?: UseRouter;
  defaultValue?: Partial<UseQueryStateSingle<T>>;
};

export function makeUseQueryState<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  return (options?: UseQueryStateOptions<T>) => {
    type SchemaType = z.infer<typeof schema>;
    type QueryStateSingle = UseQueryStateSingle<T>;
    const schemaKeys = Object.keys(schema.shape) as (keyof SchemaType)[];

    const routerFn: UseRouter = options?.router ?? useRouter;
    const { query, replace, pathname } = routerFn();

    const initial = options?.defaultValue;

    const setState = useCallback(
      (newQueryState: Partial<QueryStateSingle>) => {
        const newQuery: { [k: string]: string } = {};
        for (const k of schemaKeys) {
          const v = newQueryState[k as keyof typeof newQueryState];
          if (v !== undefined) {
            newQuery[k as string] = Array.isArray(v) ? v.join(",") : String(v);
          }
        }
        const updatedQuery = { ...query, ...newQuery };
        // Remove keys that are set to null
        for (const k of schemaKeys) {
          if (newQueryState[k as keyof typeof newQueryState] === null) {
            delete updatedQuery[k as string];
          }
        }
        const href = {
          pathname,
          query: updatedQuery,
        };
        replace(href, undefined, { shallow: true });
      },
      [replace, pathname, query, schemaKeys]
    );

    const state: Partial<QueryStateSingle> = {};
    for (const k of schemaKeys) {
      const key = k as string;
      const defaultValue = schema.shape[k]._def.defaultValue?.();
      let v = query[key];
      if (v === undefined && initial && initial[k] !== undefined) {
        v = initial[k];
      }
      if (v === undefined) {
        v = defaultValue;
      }
      if (v !== undefined) {
        try {
          const parsed = schema.shape[k].parse(ensureString(v));
          state[k] = parsed;
        } catch {
          console.error(
            `useQueryState:Error parsing query key ${key}: ${v}, defaulting to ${defaultValue}`
          );
          state[k] = defaultValue;
        }
      }
    }

    return [state as QueryStateSingle, setState] as const;
  };
}

export const makeLinkGenerator = <T extends z.ZodRawShape>(
  _schema: z.ZodObject<T>
) => {
  return (route: string, state: Partial<UseQueryStateSingle<T>>) => {
    const query: { [key: string]: string } = {};
    for (const key in state) {
      const value = state[key];
      if (value !== undefined) {
        query[key] = Array.isArray(value) ? value.join(",") : String(value);
      }
    }
    const queryString = new URLSearchParams(query).toString();
    return `${route}?${queryString}`;
  };
};
