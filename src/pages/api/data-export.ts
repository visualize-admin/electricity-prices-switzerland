import { csvFormat, format } from "d3";
import { NextApiRequest, NextApiResponse } from "next";

import buildEnv from "src/env/build";
import { parseLocaleString } from "src/locales/locales";

import {
  getObservations,
  getObservationsCube,
  getView,
} from "../../rdf/queries";

const formatters = {
  gridusagebeforediscount: format(".5f"),
  gridusagediscount: format(".5f"),
  gridpowerprice: format(".5f"),
  gridworkingprice: format(".5f"),
  energybeforediscount: format(".5f"),
  energydiscount: format(".5f"),
  energyfixcost: format(".5f"),
  energypowerprice: format(".5f"),
  energyworkingprice: format(".5f"),
  gridusage: format(".5f"),
  energy: format(".5f"),
  total: format(".5f"),
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = req.query.period?.toString() ?? buildEnv.CURRENT_PERIOD!;

  const cube = await getObservationsCube();

  const view = getView(cube);

  const dimensions = [
    "period",
    "operator",
    "operatorIdentifier",
    "operatorLabel",
    "product",
    "category",
    "gridusagename",
    "gridusagebeforediscount",
    "gridusagediscount",
    "gridpowerprice",
    "gridworkingprice",
    "energyname",
    "energybeforediscount",
    "energydiscount",
    "energyfixcost",
    "energypowerprice",
    "energyworkingprice",
    "charge",
    "aidfee",
    "gridusage",
    "energy",
    "total",
    "fixcosts",
  ];

  const observations = await getObservations(
    { source: cube.source, view, locale },
    {
      filters: {
        period: [period],
      },
      dimensions,
    }
  );

  observations.map((observation) => {
    for (const key_ in observation) {
      if (!(key_ in formatters)) {
        continue;
      }
      const key = key_ as keyof typeof formatters;
      observation[key] = formatters[key](
        observation[key as keyof typeof observation] as number
      );
    }
    return observations;
  });

  const csv = csvFormat(
    observations,
    dimensions.filter((d) => d !== "operator")
  );

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
