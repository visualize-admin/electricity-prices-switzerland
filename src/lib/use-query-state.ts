import { useRouter } from "next/router";
import { useCallback } from "react";
import * as z from "zod";

const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

export type UseQueryStateSingle<T extends z.ZodRawShape> = {
  [K in keyof T]: z.infer<T[K]>;
};

type UseRouter = typeof useRouter;

// Generic function to make useQueryState with specific schema
export function makeUseQueryState<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): (
  useRouterOption?: UseRouter
) => readonly [
  UseQueryStateSingle<T>,
  (newState: Partial<UseQueryStateSingle<T>>) => void
] {
  type SchemaType = z.infer<typeof schema>;

  type QueryStateSingle = UseQueryStateSingle<T>;

  const schemaKeys = Object.keys(schema.shape) as (keyof SchemaType)[];
  return (useRouterOption) => {
    const { query, replace, pathname } = (useRouterOption ?? useRouter)();

    const setState = useCallback(
      (newQueryState: Partial<QueryStateSingle>) => {
        const newQuery: { [k: string]: string } = {};

        for (const k of schemaKeys) {
          const v = newQueryState[k as keyof typeof newQueryState];
          if (v !== undefined) {
            // Handle arrays by joining them with commas for URL compatibility
            newQuery[k as string] = Array.isArray(v) ? v.join(",") : String(v);
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

    // Parse the current query state and apply schema transformations
    const state: Partial<QueryStateSingle> = {};

    for (const k of schemaKeys) {
      const key = k as string;
      const defaultValue = schema.shape[k]._def.defaultValue?.();
      const v = query[key] !== undefined ? query[key] : defaultValue;
      if (v !== undefined) {
        // Pass the raw value to Zod schema for parsing and transformation
        try {
          // Using the schema to parse this specific field value
          const parsed = schema.shape[k].parse(ensureString(v));
          state[k] = parsed;
        } catch {
          console.log("catch");
          // Fall back to default if parsing fails
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
  return (route: string, state: UseQueryStateSingle<T>) => {
    const query: { [key: string]: string } = {};
    for (const key in state) {
      const value = state[key];
      if (value !== undefined) {
        // Ensure consistent array handling across the application
        // Arrays should always be serialized as comma-separated strings
        query[key] = Array.isArray(value) ? value.join(",") : String(value);
      }
    }
    const queryString = new URLSearchParams(query).toString();
    return `${route}?${queryString}`;
  };
};
