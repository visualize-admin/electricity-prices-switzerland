import { useRouter } from "next/router";
import { useCallback } from "react";
import * as z from "zod";

import buildEnv from "src/env/build";

const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

type UseQueryStateSingle<T extends z.ZodRawShape> = {
  [K in keyof T]: T[K] extends z.ZodArray<z.ZodTypeAny>
    ? z.infer<T[K]>[number]
    : z.infer<T[K]>;
};

// Generic function to make useQueryState with specific schema
function makeUseQueryState<T extends z.ZodRawShape>(
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

const commonSchema = z.object({
  tab: z.enum(["electricity", "sunshine"] as const).default("electricity"),
});

const mapTabsSchema = z.enum(["electricity", "sunshine"] as const);

const periodSchema = z.string().default(buildEnv.CURRENT_PERIOD);

const energyPricesMapSchema = z.object({
  tab: mapTabsSchema.default("electricity"),
  operator: z.string().optional(),
  period: periodSchema,
  municipality: z.string().optional(),
  canton: z.string().optional(),
  category: z.string().default("H4"),
  priceComponent: z.string().default("total"),
  product: z.string().default("standard"),
  download: z.string().optional(),
  cantonsOrder: z.string().default("median-asc"),
  view: z.string().default("collapsed"),
});

const energyPricesDetailsSchema = z.object({
  operator: z.array(z.string()).optional(),
  period: z.array(periodSchema).default([buildEnv.CURRENT_PERIOD]),
  municipality: z.array(z.string()).default([]),
  canton: z.array(z.string()).default([]),
  category: z.array(z.string()).default(["H4"]),
  priceComponent: z.array(z.string()).default(["total"]),
  product: z.array(z.string()).default(["standard"]),
  cantonsOrder: z.array(z.string()).default(["median-asc"]),
  download: z.string().optional(),
  view: z.array(z.string()).default(["collapsed"]),
});

const mapSunshineSchema = z.object({
  tab: mapTabsSchema.default("sunshine"),
  period: periodSchema,
  viewBy: z.string().default("all_grid_operators"),
  typology: z.string().default("total"),
  indicator: z.string().default("saidi"),
  energyTariffCategory: z.string().default("EC2"),
  netTariffCategory: z.string().default("NC2"),
  networkLevel: z.string().default("NE5"),
});

const detailTabsSchema = z.enum([
  "network-costs",
  "network-tariffs",
  "energy-tariffs",
  "saidi",
  "saifi",
  "service-quality",
  "compliance",
] as const);

const makeLinkGenerator = <T extends z.ZodRawShape>(
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

const sunshineDetailsSchema = z.object({
  tab: detailTabsSchema.default("network-costs"),
});

export const sunshineDetailsLink = makeLinkGenerator(sunshineDetailsSchema);

export const useQueryStateMapCommon = makeUseQueryState(commonSchema);
export const useQueryStateEnergyPricesDetails = makeUseQueryState(
  energyPricesDetailsSchema
);
export const useQueryStateEnergyPricesMap = makeUseQueryState(
  energyPricesMapSchema
);
export const useQueryStateSunshineMap = makeUseQueryState(mapSunshineSchema);

export type QueryStateSingleElectricity = UseQueryStateSingle<
  typeof energyPricesMapSchema.shape
>;

/** @knipignore */
export type QueryStateSingleSunshine = UseQueryStateSingle<
  typeof mapSunshineSchema.shape
>;
