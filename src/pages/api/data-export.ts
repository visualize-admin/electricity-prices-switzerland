import { t } from "@lingui/macro";
import { csvFormatBody, format } from "d3";
import { NextApiRequest, NextApiResponse } from "next";

import { CHF_PER_YEAR, RP_PER_KWH } from "src/domain/metrics";
import { runtimeEnv } from "src/env/runtime";
import { i18n, parseLocaleString } from "src/locales/locales";
import {
  getElectricityPriceObservations,
  getElectricityPriceCube,
  getView,
} from "src/rdf/queries";
import { getSparqlClientFromRequest } from "src/rdf/sparql-client";

const formatters: Record<string, ReturnType<typeof format>> = {
  // See if this is needed later
  // gridusagebeforediscount: format(".5f"),
  // gridusagediscount: format(".5f"),
  // gridpowerprice: format(".5f"),
  // gridworkingprice: format(".5f"),
  // energybeforediscount: format(".5f"),
  // energydiscount: format(".5f"),
  // energyfixcost: format(".5f"),
  // energypowerprice: format(".5f"),
  // energyworkingprice: format(".5f"),
  // gridusage: format(".5f"),
  // energy: format(".5f"),
  // total: format(".5f"),
};

const getDimensions = () => {
  const rpKwh = i18n._(RP_PER_KWH);
  const chfYear = i18n._(CHF_PER_YEAR);

  return [
    {
      attr: "period",
      name: t({ id: "data-export.column.period", message: "Period" }),
    },
    { attr: "operator", name: "operator", hidden: true },
    {
      attr: "operatorIdentifier",
      name: t({ id: "data-export.column.operator", message: "Operator" }),
    },
    {
      attr: "operatorLabel",
      name: t({
        id: "data-export.column.operator-label",
        message: "Operator Name",
      }),
    },
    {
      attr: "product",
      name: t({ id: "data-export.column.product", message: "Product" }),
    },
    {
      attr: "category",
      name: t({ id: "data-export.column.category", message: "Category" }),
    },
    {
      attr: "gridusagename",
      name: t({
        id: "data-export.column.grid-usage-name",
        message: "Grid Usage Name",
      }),
    },
    {
      attr: "gridusagebeforediscount",
      name: `${t({ id: "data-export.column.grid-usage-before-discount", message: "Grid Usage before Discount" })} (${rpKwh})`,
    },
    {
      attr: "gridusagediscount",
      name: `${t({ id: "data-export.column.grid-usage-discount", message: "Grid Usage Discount" })} (${rpKwh})`,
    },
    {
      attr: "gridusage",
      name: `${t({ id: "data-export.column.grid-usage", message: "Grid Usage after Discount" })} (${rpKwh})`,
    },
    {
      attr: "fixcosts",
      name: `${t({ id: "data-export.column.grid-fix-costs", message: "Grid Fix Costs" })} (${chfYear})`,
    },
    {
      attr: "gridpowerprice",
      name: `${t({ id: "data-export.column.grid-power-price", message: "Grid Power Price" })} (${chfYear})`,
    },
    {
      attr: "gridworkingprice",
      name: `${t({ id: "data-export.column.grid-working-price", message: "Grid Working Price" })} (${rpKwh})`,
    },
    {
      attr: "energyname",
      name: t({
        id: "data-export.column.energy-name",
        message: "Energy Name",
      }),
    },
    {
      attr: "energybeforediscount",
      name: `${t({ id: "data-export.column.energy-before-discount", message: "Energy before Discount" })} (${rpKwh})`,
    },
    {
      attr: "energydiscount",
      name: `${t({ id: "data-export.column.energy-discount", message: "Energy Discount" })} (${rpKwh})`,
    },
    {
      attr: "energy",
      name: `${t({ id: "data-export.column.energy", message: "Energy after Discount" })} (${rpKwh})`,
    },
    {
      attr: "energyfixcost",
      name: `${t({ id: "data-export.column.energy-fix-costs", message: "Energy Fix Costs" })} (${chfYear})`,
    },
    {
      attr: "energypowerprice",
      name: `${t({ id: "data-export.column.energy-power-price", message: "Energy Power Price" })} (${chfYear})`,
    },
    {
      attr: "energyworkingprice",
      name: `${t({ id: "data-export.column.energy-working-price", message: "Energy Working Price" })} (${rpKwh})`,
    },
    {
      attr: "charge",
      name: `${t({ id: "data-export.column.charge", message: "Charge" })} (${rpKwh})`,
    },
    {
      attr: "aidfee",
      name: `${t({ id: "data-export.column.aid-fee", message: "Aid Fee" })} (${rpKwh})`,
    },
    {
      attr: "total",
      name: `${t({ id: "data-export.column.total", message: "Total" })} (${rpKwh})`,
    },
    {
      attr: "meteringrate",
      name: `${t({ id: "data-export.column.metering-rate", message: "Metering Rate" })} (${rpKwh})`,
    },
    {
      attr: "annualmeteringcost",
      name: `${t({ id: "data-export.column.annual-metering-cost", message: "Annual Metering Cost" })} (${chfYear})`,
    },
  ] as const;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = req.query.period?.toString() ?? runtimeEnv.CURRENT_PERIOD!;

  // Activate locale before building dimensions so t() picks up the right language
  i18n.activate(locale);
  const dimensions = getDimensions();

  const client = await getSparqlClientFromRequest(req);
  const cube = await getElectricityPriceCube(client);

  const view = getView(cube);

  const observations = await getElectricityPriceObservations(
    { source: cube.source, view, locale },
    {
      filters: {
        period: [period],
      },
      dimensions: dimensions.map((x) => x.attr),
    }
  );

  observations.map((observation) => {
    for (const key_ in observation) {
      if (!(key_ in formatters)) {
        continue;
      }
      if (!observation[key_ as keyof typeof observation]) {
        continue;
      }
      const key = key_ as keyof typeof formatters;
      observation[key] = formatters[key](
        observation[key as keyof typeof observation] as number
      );
    }
    return observations;
  });

  const usedDimensions = dimensions.filter((d) => !("hidden" in d && d.hidden));
  const columns = usedDimensions.map((x) => x.attr);
  const header = usedDimensions.map((x) => x.name).join(", ");
  const csv = `${header}\n${csvFormatBody(observations, columns)}`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment;filename=elcom-data-${period}.csv`
  );
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate"
  );
  res.send(csv);
};
