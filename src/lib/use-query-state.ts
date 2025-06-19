import { useRouter } from "next/router";
import { useCallback } from "react";
import * as z from "zod";

import buildEnv from "src/env/build";

const ensureArray = (input: string | string[]): string[] =>
  Array.isArray(input) ? input : [input];
const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

type UseQueryStateSingle<T extends z.ZodRawShape> = {
  [K in keyof T]: T[K] extends z.ZodArray<z.ZodTypeAny>
    ? z.infer<T[K]>[number]
    : z.infer<T[K]>;
};
type UseQueryStateArray<T extends z.ZodRawShape> = {
  [K in keyof T]: T[K] extends z.ZodArray<z.ZodTypeAny>
    ? z.infer<T[K]>
    : string[];
};

// Generic function to make useQueryState with specific schema
function makeUseQueryState<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): {
  useQueryState: () => readonly [
    UseQueryStateArray<T>,
    (newState: Partial<UseQueryStateArray<T>>) => void
  ];
  useQueryStateSingle: () => readonly [
    UseQueryStateSingle<T>,
    (newState: Partial<UseQueryStateSingle<T>>) => void
  ];
} {
  type SchemaType = z.infer<typeof schema>;

  // Create array version for multi-select
  const makeUseQueryStateArray = () => {
    type QueryStateArray = {
      [K in keyof SchemaType]: SchemaType[K] extends z.ZodArray<$IntentionalAny>
        ? z.infer<SchemaType[K]>
        : string[];
    };

    const schemaKeys = Object.keys(schema.shape) as (keyof SchemaType)[];

    return () => {
      const { query, replace, pathname } = useRouter();

      const setState = useCallback(
        (newQueryState: Partial<QueryStateArray>) => {
          const newQuery: { [k: string]: string[] } = {};

          for (const k of schemaKeys) {
            const v = newQueryState[k as keyof typeof newQueryState];
            if (v !== undefined) {
              newQuery[k as string] = v as string[];
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

      const state: Partial<QueryStateArray> = {};

      for (const k of schemaKeys) {
        const key = k as string;
        const defaultValue = schema.shape[k]._def.defaultValue?.();
        const v = query[key] !== undefined ? query[key] : defaultValue;

        if (v !== undefined) {
          state[k] = ensureArray(v);
        }
      }

      return [state as QueryStateArray, setState] as const;
    };
  };

  // Create single value version
  const makeUseQueryStateSingle = () => {
    type QueryStateSingle = {
      [K in keyof SchemaType]: SchemaType[K] extends z.ZodArray<$IntentionalAny>
        ? z.infer<SchemaType[K]>[number]
        : z.infer<SchemaType[K]>;
    };

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
  };

  return {
    useQueryState: makeUseQueryStateArray(),
    useQueryStateSingle: makeUseQueryStateSingle(),
  };
}

const commonSchema = z.object({
  tab: z.enum(["electricity", "sunshine"] as const).default("electricity"),
});

const tabsSchema = z.enum(["electricity", "sunshine"] as const);

// Example schemas for different pages
const electricitySchema = z.object({
  tab: tabsSchema.default("electricity"),
  operator: z.string().optional(),
  period: z.string().default(buildEnv.CURRENT_PERIOD),
  municipality: z.string().optional(),
  canton: z.string().optional(),
  category: z.string().default("H4"),
  priceComponent: z.string().default("total"),
  product: z.string().default("standard"),
  download: z.string().optional(),
  cantonsOrder: z.string().default("median-asc"),
  view: z.string().default("collapsed"),
});

const sunshineSchema = z.object({
  tab: tabsSchema.default("sunshine"),
  period: z.string().default(buildEnv.CURRENT_PERIOD),
  viewBy: z.string().default("all_grid_operators"),
  typology: z.string().default("total"),
  indicator: z.string().default("saidi"),
  energyTariffCategory: z.string().default("EC2"),
  netTariffCategory: z.string().default("NC2"),
  networkLevel: z.string().default("NE5"),
});

export const { useQueryStateSingle: useQueryStateSingleCommon } =
  makeUseQueryState(commonSchema);

// Create the hooks
export const {
  useQueryState: useQueryStateElectricity,
  useQueryStateSingle: useQueryStateSingleElectricity,
} = makeUseQueryState(electricitySchema);

export const { useQueryStateSingle: useQueryStateSingleSunshine } =
  makeUseQueryState(sunshineSchema);

export type QueryStateSingleElectricity = UseQueryStateSingle<
  typeof electricitySchema.shape
>;

/** @knipignore */
export type QueryStateArrayElectricity = UseQueryStateArray<
  typeof electricitySchema.shape
>;

/** @knipignore */
export type QueryStateSingleSunshine = UseQueryStateSingle<
  typeof sunshineSchema.shape
>;

/** @knipignore */
export type QueryStateArraySunshine = UseQueryStateArray<
  typeof sunshineSchema.shape
>;
