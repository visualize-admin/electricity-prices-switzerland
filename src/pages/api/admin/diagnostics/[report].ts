import { NextApiHandler } from "next";

import { KNOWN_REPORT_ERRORS, REPORTS } from "src/domain/diagnostics/report-registry";
import { REPORT_IDS } from "src/domain/diagnostics/report-specs";
import { executeGraphqlQueryAsClient } from "src/graphql/execute-graphql-query-as-client";
import { contextFromAPIRequest } from "src/graphql/server-context";
import { apolloServer } from "src/pages/api/graphql";
import { createExecuteGraphqlQuery } from "src/utils/execute-graphql-query";

/**
 * GET /api/admin/diagnostics/[report]?year=...&...
 *
 * Runs the same fetch/build pair `energy-prices:cli` uses for the matching
 * subcommand (see `src/domain/report-registry.ts`) against this
 * deployment's own GraphQL API, and returns both the structured data and
 * the CLI-identical text report. Read-only, so no CSRF token; protected by
 * the existing `/api/admin/*` middleware (`src/middlewares/admin.ts`).
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED" });
    return;
  }

  const reportId = req.query.report;
  if (typeof reportId !== "string" || !(reportId in REPORTS)) {
    res.status(404).json({
      ok: false,
      code: "UNKNOWN_REPORT",
      message: `Unknown report: ${reportId}. Known reports: ${REPORT_IDS.join(
        ", "
      )}`,
    });
    return;
  }

  const report = REPORTS[reportId as keyof typeof REPORTS];

  const args: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "report") continue;
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined) continue;
    args[key] = report.numericArgs.includes(key) ? Number(raw) : raw;
  }

  try {
    const context = await contextFromAPIRequest(req);
    const client = executeGraphqlQueryAsClient(
      createExecuteGraphqlQuery(apolloServer)(context)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await report.fetch(client, args as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = report.build(data as any);

    res.status(200).json({ ok: true, data, text });
  } catch (error) {
    const knownError = KNOWN_REPORT_ERRORS.find((E) => error instanceof E);
    if (knownError) {
      res.status(404).json({
        ok: false,
        code: (error as InstanceType<typeof knownError>).code,
        message: (error as Error).message,
      });
      return;
    }

    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export default handler;
