import { csvFormat } from "d3";
import { NextApiRequest, NextApiResponse } from "next";



import { parseLocaleString } from "../../locales/locales";
import {
  getObservations,
  getObservationsCube,
  getView,
} from "../../rdf/queries";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = req.query.period?.toString() ?? process.env.CURRENT_PERIOD!;

  const cube = await getObservationsCube();

  const view = getView(cube);

  const dimensions = [
    "period",
    // "municipality",
    // "municipalityLabel",
    "operator",
    "operatorLabel",
    "category",
    "product",
    "aidfee",
    "charge",
    "gridusage",
    "energy",
    // "fixcostspercent",
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

  const csv = csvFormat(observations, dimensions);

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
