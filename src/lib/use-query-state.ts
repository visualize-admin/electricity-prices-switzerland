import { useRouter } from "next/router";
import { useCallback } from "react";
import * as z from "zod";

const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

export type UseQueryStateSingle<T extends z.ZodRawShape> = {
  [K in keyof T]: T[K] extends z.ZodArray<z.ZodTypeAny>
    ? z.infer<T[K]>[number]
    : z.infer<T[K]>;
};

// Generic function to make useQueryState with specific schema
export function makeUseQueryState<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): () => readonly [
  UseQueryStateSingle<T>,
  (newState: Partial<UseQueryStateSingle<T>>) => void
] {
  type SchemaType = z.infer<typeof schema>;

  type QueryStateSingle = UseQueryStateSingle<T>;

  const schemaKeys = Object.keys(schema.shape) as (keyof SchemaType)[];
  return () => {
    const { query, replace, pathname } = useRouter();

    const setState = useCallback(
      (newQueryState: Partial<QueryStateSingle>) => {
        const newQuery: { [k: string]: string } = {};

        for (const k of schemaKeys) {
          const v = newQueryState[k as keyof typeof newQueryState];
          if (v !== undefined) {
            newQuery[k as string] = v as string;
          }
        }

        const href = {
          pathname,
          query: { ...query, ...newQuery },
        };

        replace(href, undefined, { shallow: true });
      },
      [replace, pathname, query]
    );

    const state: Partial<QueryStateSingle> = {};

    for (const k of schemaKeys) {
      const key = k as string;
      const defaultValue = schema.shape[k]._def.defaultValue?.();
      const v = query[key] !== undefined ? query[key] : defaultValue;

      if (v !== undefined) {
        state[k] = ensureString(v);
      }
    }

    return [state as QueryStateSingle, setState] as const;
  };
}

export const makeLinkGenerator = <T extends z.ZodRawShape>(
  _schema: z.ZodObject<T>
) => {
  return (route: string, state: UseQueryStateSingle<T>) => {
    const query: { [key: string]: string } = {};
    for (const key in state) {
      const value = state[key];
      if (value !== undefined) {
        query[key] = Array.isArray(value) ? value.join(",") : value;
      }
    }
    const queryString = new URLSearchParams(query).toString();
    return `${route}?${queryString}`;
  };
};
