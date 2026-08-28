import { ReportId } from "src/domain/diagnostics/report-specs";
import {
  energyPricesMapSchema,
  mapCommonSchema,
  sunshineMapSchema,
} from "src/domain/query-states";

/**
 * Builds a plain object from a query string, keeping only the keys the
 * given schema declares (so stray params like `download`/`view` can't leak
 * in), and drops any kept key whose value fails that field's own
 * validation (e.g. a `period` no longer in the valid years list) so the
 * schema's own `.default(...)` fills it in instead of the whole parse
 * failing over one stale field.
 */
function pickValidatedFields<T extends { shape: Record<string, unknown> }>(
  schema: T,
  params: URLSearchParams
): Record<string, string> {
  const shape = schema.shape as Record<
    string,
    { safeParse: (v: unknown) => { success: boolean } }
  >;
  const candidate: Record<string, string> = {};
  for (const key of Object.keys(shape)) {
    const value = params.get(key);
    if (value === null) continue;
    if (shape[key].safeParse(value).success) {
      candidate[key] = value;
    }
  }
  return candidate;
}

export type MapUrlDiagnosis = {
  reportId: ReportId;
  values: Record<string, string>;
};

/**
 * Infers which `energy-prices:cli` report (see `src/domain/report-specs.ts`)
 * answers "why does the map look like this" for a pasted map URL, and which
 * values to run it with — reusing the exact schemas
 * (`src/domain/query-states.ts`) and defaults the map itself uses, so this
 * can't drift from what the URL actually means to the app. Used by both the
 * admin diagnostics page and the CLI's `diagnose` subcommand.
 *
 * Returns `null` only when the query string has none of the map's own
 * params at all (nothing recognizable); a partial/stale match still
 * resolves via the schemas' defaults.
 */
export function inferReportFromMapUrl(input: string): MapUrlDiagnosis | null {
  const queryString = input.includes("?")
    ? input.slice(input.indexOf("?") + 1)
    : input;
  const params = new URLSearchParams(queryString);

  const commonCandidate = pickValidatedFields(mapCommonSchema, params);
  if (Object.keys(commonCandidate).length === 0) {
    return null;
  }
  const common = mapCommonSchema.parse(commonCandidate);

  if (common.tab === "sunshine") {
    const sunshine = sunshineMapSchema.parse(
      pickValidatedFields(sunshineMapSchema, params)
    );
    const hasExplicitIndicator = params.has("indicator");

    if (common.activeId) {
      if (hasExplicitIndicator) {
        return {
          reportId: "sunshine",
          values: {
            operator: common.activeId,
            year: sunshine.period,
            indicator: sunshine.indicator,
            networkLevel: sunshine.networkLevel,
          },
        };
      }
      return {
        reportId: "operator",
        values: { operator: common.activeId, year: sunshine.period },
      };
    }

    return {
      reportId: "sunshine",
      values: {
        year: sunshine.period,
        indicator: sunshine.indicator,
        networkLevel: sunshine.networkLevel,
      },
    };
  }

  const electricity = energyPricesMapSchema.parse(
    pickValidatedFields(energyPricesMapSchema, params)
  );
  const shared = {
    year: electricity.period,
    category: electricity.category,
    priceComponent: electricity.priceComponent,
    product: electricity.product,
  };

  if (common.activeId) {
    if (electricity.entity === "operator") {
      return {
        reportId: "operator",
        values: { operator: common.activeId, year: electricity.period },
      };
    }
    if (electricity.entity === "canton") {
      return {
        reportId: "canton",
        values: { canton: common.activeId, ...shared },
      };
    }
    return {
      reportId: "municipality",
      values: { municipality: common.activeId, ...shared },
    };
  }

  return {
    reportId: "gray-areas",
    values: {
      ...shared,
      entity: electricity.entity === "operator" ? "operator" : "municipality",
    },
  };
}
