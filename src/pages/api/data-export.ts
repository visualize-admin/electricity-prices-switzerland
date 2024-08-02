import { csvFormatBody, format } from "d3";
import { NextApiRequest, NextApiResponse } from "next";

import buildEnv from "src/env/build";
import { parseLocaleString } from "src/locales/locales";

import {
  getObservations,
  getObservationsCube,
  getView,
} from "../../rdf/queries";

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

const dimensions = [
  { attr: "period", name: "period" },
  { attr: "operator", name: "operator", hidden: true },
  { attr: "operatorIdentifier", name: "operator" },
  { attr: "operatorLabel", name: "operatorLabel" },
  { attr: "product", name: "product" },
  { attr: "category", name: "category" },
  { attr: "gridusagename", name: "gridusagename" },
  {
    attr: "gridusagebeforediscount",
    name: "gridusage before discount (cts./kWh)",
  },
  { attr: "gridusagediscount", name: "gridusagediscount discount (cts./kWh)" },
  { attr: "gridusage", name: "gridusage after discount (cts./kWh)" },
  { attr: "fixcosts", name: "hereof grid: fixcosts (CHF p.a.)" },
  { attr: "gridpowerprice", name: "hereof grid: power price (CHF p.a.)" },
  { attr: "gridworkingprice", name: "hereof grid: working price (cts./kWh)" },
  { attr: "energyname", name: "energyname" },
  { attr: "energybeforediscount", name: "energy before discount (cts./kWh)" },
  { attr: "energydiscount", name: "energy discount (cts./kWh)" },
  { attr: "energy", name: "energy after discount (cts./kWh)" },
  { attr: "energyfixcost", name: "hereof energy: fixcosts (CHF p.a.)" },
  { attr: "energypowerprice", name: "hereof energy: power price (CHF p.a.)" },
  {
    attr: "energyworkingprice",
    name: "hereof energy: working price (cts./kWh)",
  },
  { attr: "charge", name: "charge (cts./kWh)" },
  { attr: "aidfee", name: "aidfee (cts./kWh)" },
  { attr: "total", name: "total (cts./kWh)" },
];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = req.query.period?.toString() ?? buildEnv.CURRENT_PERIOD!;

  const cube = await getObservationsCube();

  const view = getView(cube);

  const observations = await getObservations(
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

  const usedDimensions = dimensions.filter((d) => !d?.hidden);
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
