import { t } from "@lingui/macro";
import { csvFormat } from "d3";
import { NextApiHandler } from "next";

import {
  COUNT_PER_YEAR,
  DAYS,
  getNetworkLevelMetrics,
  MIN_PER_YEAR,
  RP_PER_KWH,
  SWISS_FRANCS,
} from "src/domain/metrics";
import { runtimeEnv } from "src/env/runtime";
import { contextFromAPIRequest } from "src/graphql/server-context";
import { i18n, parseLocaleString } from "src/locales/locales";

type Formatter = (value: unknown) => string | number | null;

const formatBoolean = (value: unknown): string => {
  if (value === true) return i18n._({ id: "boolean.yes", message: "Ja" });
  if (value === false) return i18n._({ id: "boolean.no", message: "Nein" });
  return "";
};

// round to 3 decimal places, keep number, not string, for better Excel compatibility
const formatNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Math.round(value * 1000) / 1000;
  }
  return null;
};
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
    {
      attr: "peerGroup",
      name: t({
        id: "sunshine.export.column.peer-group",
        message: "Peer Group",
      }),
    },
    {
      attr: "networkCostsNE5",
      name: `${networkCostsLabel} NE5 (${ne5Unit})`,
      format: formatNumber,
    },
    {
      attr: "networkCostsNE6",
      name: `${networkCostsLabel} NE6 (${ne6Unit})`,
      format: formatNumber,
    },
    {
      attr: "networkCostsNE7",
      name: `${networkCostsLabel} NE7 (${ne7Unit})`,
      format: formatNumber,
    },
    {
      attr: "saidiTotal",
      name: `${t({
        id: "sunshine.export.column.saidi-total",
        message: "SAIDI Total",
      })} (${minYear})`,
      format: formatNumber,
    },
    {
      attr: "saidiUnplanned",
      name: `${t({
        id: "sunshine.export.column.saidi-unplanned",
        message: "SAIDI Unplanned",
      })} (${minYear})`,
      format: formatNumber,
    },
    {
      attr: "saifiTotal",
      name: `${t({
        id: "sunshine.export.column.saifi-total",
        message: "SAIFI Total",
      })} (${countYear})`,
      format: formatNumber,
    },
    {
      attr: "saifiUnplanned",
      name: `${t({
        id: "sunshine.export.column.saifi-unplanned",
        message: "SAIFI Unplanned",
      })} (${countYear})`,
      format: formatNumber,
    },
    {
      attr: "francRule",
      name: `${t({
        id: "indicator.compliance",
        message: "Costs and profit",
      })} (${chf})`,
      format: formatNumber,
    },
    {
      attr: "infoYesNo",
      name: t({
        id: "sunshine.export.column.customer-outage-notification",
        message: "Customer Outage Notification",
      }),
      format: formatBoolean as Formatter,
    },
    {
      attr: "infoDaysInAdvance",
      name: `${t({
        id: "sunshine.export.column.days-in-advance",
        message: "Days in Advance for Notification",
      })} (${days})`,
      format: formatNumber,
    },
    {
      attr: "timely",
      name: t({
        id: "sunshine.export.column.timely-submission",
        message: "Timely Paper Submission",
      }),
      format: formatBoolean as Formatter,
    },
    {
      attr: "tariffEC2",
      name: `${energyTariffLabel} C2 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffEC3",
      name: `${energyTariffLabel} C3 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffEC4",
      name: `${energyTariffLabel} C4 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffEC6",
      name: `${energyTariffLabel} C6 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffEH2",
      name: `${energyTariffLabel} H2 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffEH4",
      name: `${energyTariffLabel} H4 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffEH7",
      name: `${energyTariffLabel} H7 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNC2",
      name: `${netTariffLabel} C2 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNC3",
      name: `${netTariffLabel} C3 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNC4",
      name: `${netTariffLabel} C4 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNC6",
      name: `${netTariffLabel} C6 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNH2",
      name: `${netTariffLabel} H2 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNH4",
      name: `${netTariffLabel} H4 (${rpKwh})`,
      format: formatNumber,
    },
    {
      attr: "tariffNH7",
      name: `${netTariffLabel} H7 (${rpKwh})`,
      format: formatNumber,
    },
  ];
};

const handler: NextApiHandler = async (req, res) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = (req.query.period as string) ?? runtimeEnv.CURRENT_PERIOD;
  const peerGroup = req.query.peerGroup as string | undefined;

  // Activate locale before building dimensions so t() picks up the right language
  i18n.activate(locale);
  const dimensions = getDimensions();

  const context = await contextFromAPIRequest(req);
  const [data, peerGroups] = await Promise.all([
    context.sunshineDataService.getSunshineData({ period, peerGroup }),
    context.sunshineDataService.getPeerGroups(locale),
  ]);

  const peerGroupNameById = new Map(peerGroups.map((pg) => [pg.id, pg.name]));

  const columns = dimensions.map((d) => d.name);
  const rows = data.map((row) => {
    const enriched = {
      ...row,
      peerGroup: peerGroupNameById.get(row.peerGroupId ?? "") ?? "",
    };
    return Object.fromEntries(
      dimensions.map((d) => {
        const value = enriched[d.attr as keyof typeof enriched];
        return [d.name, d.format ? d.format(value) : (value as string | null)];
      }),
    );
  });

  const csv = csvFormat(rows, columns);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment;filename=elcom-sunshine-data-${period}.csv`,
  );
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate",
  );
  res.status(200).send(csv);
};

export default handler;
