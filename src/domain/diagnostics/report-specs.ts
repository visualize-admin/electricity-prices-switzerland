import { categories, mapPriceComponents, products } from "src/domain/data";
import {
  energyPricesMapSchema,
  sunshineMapSchema,
} from "src/domain/query-states";
import { indicatorOptions } from "src/domain/sunshine";

/**
 * Canonical list of report ids, one per `energy-prices:cli` subcommand.
 * Lives here (client-safe, no GraphQL/urql imports) rather than in
 * `report-registry.ts` (server-only) so browser code — this file's
 * `REPORT_SPECS` and `src/domain/map-url-diagnosis.ts` — can reference the
 * type without pulling in every `fetch*ReportData` function.
 */
export const REPORT_IDS = [
  "municipality",
  "operator",
  "canton",
  "gray-areas",
  "anomalies",
  "sunshine",
] as const;

export type ReportId = (typeof REPORT_IDS)[number];

type FieldSpec = {
  name: string;
  label: string;
  kind: "text" | "select";
  options?: readonly string[];
  required: boolean;
  defaultValue?: string;
};

type ReportSpec = {
  id: ReportId;
  label: string;
  fields: FieldSpec[];
};

/**
 * The map's own defaults, reused instead of re-hardcoding them here — see
 * `src/components/electricity-selectors.tsx` /
 * `src/components/sunshine-selectors/base.tsx` for the matching field
 * order, which the schemas don't encode and so is still set by hand below.
 */
const electricityDefaults = energyPricesMapSchema.parse({});
const sunshineDefaults = sunshineMapSchema.parse({});

// Order matches src/components/electricity-selectors.tsx: Year, Price
// component, Category, Product.
const PRICE_FILTER_FIELDS: FieldSpec[] = [
  {
    name: "year",
    label: "Year",
    kind: "text",
    required: true,
    defaultValue: electricityDefaults.period,
  },
  {
    name: "priceComponent",
    label: "Price component",
    kind: "select",
    options: mapPriceComponents,
    required: true,
    defaultValue: electricityDefaults.priceComponent,
  },
  {
    name: "category",
    label: "Category",
    kind: "select",
    options: categories,
    required: true,
    defaultValue: electricityDefaults.category,
  },
  {
    name: "product",
    label: "Product",
    kind: "select",
    options: products,
    required: true,
    defaultValue: electricityDefaults.product,
  },
  {
    name: "networkLevel",
    label: "Network level",
    kind: "text",
    required: false,
  },
];

/**
 * Client-safe (no server-only imports) form specs for the admin diagnostics
 * page, one per `energy-prices:cli` subcommand.
 */
export const REPORT_SPECS: ReportSpec[] = [
  {
    id: "municipality",
    label: "Municipality",
    fields: [
      {
        name: "municipality",
        label: "Municipality id or name",
        kind: "text",
        required: true,
      },
      ...PRICE_FILTER_FIELDS,
    ],
  },
  {
    id: "operator",
    label: "Operator",
    fields: [
      {
        name: "operator",
        label: "Operator id or name",
        kind: "text",
        required: true,
      },
      {
        name: "year",
        label: "Year",
        kind: "text",
        required: true,
        defaultValue: electricityDefaults.period,
      },
      {
        name: "networkLevel",
        label: "Network level",
        kind: "text",
        required: false,
      },
    ],
  },
  {
    id: "canton",
    label: "Canton",
    fields: [
      {
        name: "canton",
        label: "Canton id or name",
        kind: "text",
        required: true,
      },
      ...PRICE_FILTER_FIELDS,
    ],
  },
  {
    id: "gray-areas",
    label: "Gray Areas",
    fields: [
      ...PRICE_FILTER_FIELDS,
      {
        name: "entity",
        label: "Entity",
        kind: "select",
        options: ["municipality", "operator"],
        required: false,
        defaultValue: electricityDefaults.entity,
      },
      { name: "limit", label: "Limit", kind: "text", required: false },
    ],
  },
  {
    id: "anomalies",
    label: "Anomalies",
    fields: [
      {
        name: "year",
        label: "Year",
        kind: "text",
        required: true,
        defaultValue: electricityDefaults.period,
      },
      {
        name: "networkLevel",
        label: "Network level",
        kind: "text",
        required: false,
        defaultValue: sunshineDefaults.networkLevel,
      },
      {
        name: "minMinorityRatio",
        label: "Min minority ratio",
        kind: "text",
        required: false,
      },
      { name: "limit", label: "Limit", kind: "text", required: false },
    ],
  },
  {
    id: "sunshine",
    label: "Sunshine",
    fields: [
      {
        name: "operator",
        label: "Operator id or name",
        kind: "text",
        required: true,
      },
      {
        name: "year",
        label: "Year",
        kind: "text",
        required: true,
        defaultValue: sunshineDefaults.period,
      },
      {
        name: "indicator",
        label: "Indicator",
        kind: "select",
        options: indicatorOptions,
        required: true,
        defaultValue: sunshineDefaults.indicator,
      },
      {
        name: "networkLevel",
        label: "Network level",
        kind: "text",
        required: false,
        defaultValue: sunshineDefaults.networkLevel,
      },
    ],
  },
];
