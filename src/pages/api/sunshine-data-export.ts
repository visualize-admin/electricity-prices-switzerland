import { t } from "@lingui/macro";
import { csvFormat } from "d3";
import { NextApiHandler } from "next";

import {
  DAYS,
  COUNT_PER_YEAR,
  MIN_PER_YEAR,
  RP_PER_KWH,
  SWISS_FRANCS,
  getNetworkLevelMetrics,
} from "src/domain/metrics";
import { runtimeEnv } from "src/env/runtime";
import { contextFromAPIRequest } from "src/graphql/server-context";
import { i18n, parseLocaleString } from "src/locales/locales";

const getDimensions = () => {
  const rpKwh = i18n._(RP_PER_KWH);
  const minYear = i18n._(MIN_PER_YEAR);
  const countYear = i18n._(COUNT_PER_YEAR);
  const chf = i18n._(SWISS_FRANCS);
  const days = i18n._(DAYS);
  const ne5Unit = i18n._(getNetworkLevelMetrics("NE5"));
  const ne6Unit = i18n._(getNetworkLevelMetrics("NE6"));
  const ne7Unit = i18n._(getNetworkLevelMetrics("NE7"));

  const networkCostsLabel = t({
    id: "sunshine.export.column.network-costs",
    message: "Network Costs",
  });
  const energyTariffLabel = t({
    id: "sunshine.export.column.energy-tariff",
    message: "Energy Tariff",
  });
  const netTariffLabel = t({
    id: "sunshine.export.column.net-tariff",
    message: "Net Tariff",
  });

  return [
    {
      attr: "operatorId",
      name: t({
        id: "sunshine.export.column.operator-id",
        message: "Operator ID",
      }),
    },
    {
      attr: "operatorUID",
      name: t({
        id: "sunshine.export.column.operator-uid",
        message: "Operator UID",
      }),
    },
    {
      attr: "name",
      name: t({
        id: "sunshine.export.column.operator-name",
        message: "Operator Name",
      }),
    },
    {
      attr: "period",
      name: t({ id: "sunshine.export.column.period", message: "Period" }),
    },
    { attr: "networkCostsNE5", name: `${networkCostsLabel} NE5 (${ne5Unit})` },
    { attr: "networkCostsNE6", name: `${networkCostsLabel} NE6 (${ne6Unit})` },
    { attr: "networkCostsNE7", name: `${networkCostsLabel} NE7 (${ne7Unit})` },
    {
      attr: "saidiTotal",
      name: `${t({ id: "sunshine.export.column.saidi-total", message: "SAIDI Total" })} (${minYear})`,
    },
    {
      attr: "saidiUnplanned",
      name: `${t({ id: "sunshine.export.column.saidi-unplanned", message: "SAIDI Unplanned" })} (${minYear})`,
    },
    {
      attr: "saifiTotal",
      name: `${t({ id: "sunshine.export.column.saifi-total", message: "SAIFI Total" })} (${countYear})`,
    },
    {
      attr: "saifiUnplanned",
      name: `${t({ id: "sunshine.export.column.saifi-unplanned", message: "SAIFI Unplanned" })} (${countYear})`,
    },
    {
      attr: "francRule",
      name: `${t({ id: "sunshine.export.column.franc-rule", message: "Franc Rule" })} (${chf})`,
    },
    {
      attr: "infoYesNo",
      name: t({
        id: "sunshine.export.column.customer-outage-notification",
        message: "Customer Outage Notification",
      }),
    },
    {
      attr: "infoDaysInAdvance",
      name: `${t({ id: "sunshine.export.column.days-in-advance", message: "Days in Advance for Notification" })} (${days})`,
    },
    {
      attr: "timely",
      name: t({
        id: "sunshine.export.column.timely-submission",
        message: "Timely Paper Submission",
      }),
    },
    { attr: "tariffEC2", name: `${energyTariffLabel} C2 (${rpKwh})` },
    { attr: "tariffEC3", name: `${energyTariffLabel} C3 (${rpKwh})` },
    { attr: "tariffEC4", name: `${energyTariffLabel} C4 (${rpKwh})` },
    { attr: "tariffEC6", name: `${energyTariffLabel} C6 (${rpKwh})` },
    { attr: "tariffEH2", name: `${energyTariffLabel} H2 (${rpKwh})` },
    { attr: "tariffEH4", name: `${energyTariffLabel} H4 (${rpKwh})` },
    { attr: "tariffEH7", name: `${energyTariffLabel} H7 (${rpKwh})` },
    { attr: "tariffNC2", name: `${netTariffLabel} C2 (${rpKwh})` },
    { attr: "tariffNC3", name: `${netTariffLabel} C3 (${rpKwh})` },
    { attr: "tariffNC4", name: `${netTariffLabel} C4 (${rpKwh})` },
    { attr: "tariffNC6", name: `${netTariffLabel} C6 (${rpKwh})` },
    { attr: "tariffNH2", name: `${netTariffLabel} H2 (${rpKwh})` },
    { attr: "tariffNH4", name: `${netTariffLabel} H4 (${rpKwh})` },
    { attr: "tariffNH7", name: `${netTariffLabel} H7 (${rpKwh})` },
  ] as const;
};

const handler: NextApiHandler = async (req, res) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = (req.query.period as string) ?? runtimeEnv.CURRENT_PERIOD;
  const peerGroup = req.query.peerGroup as string | undefined;

  // Activate locale before building dimensions so t() picks up the right language
  i18n.activate(locale);
  const dimensions = getDimensions();

  const context = await contextFromAPIRequest(req);
  const data = await context.sunshineDataService.getSunshineData({
    period,
    peerGroup,
  });

  const columns = dimensions.map((d) => d.name);
  const rows = data.map((row) =>
    Object.fromEntries(
      dimensions.map((d) => [d.name, row[d.attr as keyof typeof row]])
    )
  );

  const csv = csvFormat(rows, columns);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment;filename=elcom-sunshine-data-${period}.csv`
  );
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate"
  );
  res.status(200).send(csv);
};

export default handler;
