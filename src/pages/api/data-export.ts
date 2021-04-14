import { NextApiRequest, NextApiResponse } from "next";
import {
  getObservations,
  getSource,
  getView,
  stripNamespaceFromIri,
} from "../../rdf/queries";
import { parseLocaleString } from "../../locales/locales";
import { parseObservationValue } from "../../lib/observations";
import { dsv, csv, csvFormat } from "d3";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const locale = parseLocaleString(req.query.locale?.toString());
  const period = req.query.period?.toString() ?? "2020";

  const source = getSource();
  const cube = await source.cube(
    "https://energy.ld.admin.ch/elcom/electricityprice/cube"
  );

  if (!cube) {
    throw Error(
      `No cube ${"https://energy.ld.admin.ch/elcom/electricityprice/cube"}`
    );
  }

  const view = getView(cube);

  const dimensions = [
    "period",
    "municipality",
    "municipalityLabel",
    "operator",
    "operatorLabel",
    "category",
    "product",
    "aidfee",
    "fixcosts",
    "charge",
    "gridusage",
    "energy",
    "fixcostspercent",
    "total",
  ];

  const rawObservations = await getObservations(
    { source, view, locale },
    {
      filters: {
        period: [period],
      },
      dimensions,
    }
  );

  const observations = rawObservations.map((d) => {
    let parsed: { [k: string]: string | number | boolean } = {};
    for (const [k, v] of Object.entries(d)) {
      const key = k.replace(
        "https://energy.ld.admin.ch/elcom/electricityprice/dimension/",
        ""
      );
      const parsedValue = parseObservationValue(v);

      parsed[key] =
        typeof parsedValue === "string"
          ? stripNamespaceFromIri({ dimension: key, iri: parsedValue })
          : parsedValue;
    }
    return parsed;
  });

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
