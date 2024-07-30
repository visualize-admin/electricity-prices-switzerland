import fs from "fs";

import { csvFormat } from "d3";
import { mapValues } from "lodash";
import { NextApiHandler } from "next";
import { z } from "zod";

import buildEnv from "src/env/build";

const MunicipalityInfo = z
  .object({
    netzbetreiber: z.string(),
    webseite: z.string().optional(),
    gemeindeNummer: z.string().transform(Number),
    gemeindeName: z.string(),
    postleitzahl: z.string(),
    kanton: z.enum([
      "AG",
      "AI",
      "AR",
      "BE",
      "BL",
      "BS",
      "FR",
      "GE",
      "GL",
      "GR",
      "JU",
      "LU",
      "NE",
      "NW",
      "OW",
      "SG",
      "SH",
      "SO",
      "SZ",
      "TG",
      "TI",
      "UR",
      "VD",
      "VS",
      "ZG",
      "ZH",
    ]),
  })
  .transform((x) => ({
    operator: x.netzbetreiber,
    website: x.webseite,
    municipalityNumber: x.gemeindeNummer,
    municipalityName: x.gemeindeName,
    postalCode: x.postleitzahl,
    canton: x.kanton,
  }));

type SparqlResponse = {
  results: {
    bindings: Record<string, { value: unknown }>[];
  };
};

type MunicipalityInfo = z.infer<typeof MunicipalityInfo>;

const fetchMunicipalitiesInfo = async (period: number) => {
  const sp = new URLSearchParams();
  sp.append(
    "query",
    /* sparql */ `
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cube: <https://cube.link/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX strom: <https://energy.ld.admin.ch/elcom/electricityprice/dimension/>

SELECT DISTINCT ?netzbetreiber ?webseite ?gemeindeNummer ?gemeindeName ?postleitzahl ?kanton
FROM <https://lindas.admin.ch/elcom/electricityprice>
FROM <https://lindas.admin.ch/territorial>
FROM <https://lindas.admin.ch/fso/register>
WHERE {
  {
    SELECT ?municipality ?gemeindeName ?gemeindeNummer ?kanton (IF(MIN(?plz) = MAX(?plz), MIN(?plz), CONCAT(MIN(?plz), " - ", MAX(?plz))) AS ?postleitzahl)
    WHERE {
      ?municipality schema:name ?gemeindeName ;
        schema:identifier ?gemeindeNummer ;
        schema:postalCode ?plz ;
        schema:containedInPlace ?canton .

      ?canton a <https://schema.ld.admin.ch/Canton> ;
        schema:alternateName ?kanton .
    }
    GROUP BY ?municipality ?gemeindeName ?gemeindeNummer ?kanton
  }
  
    {  
    SELECT ?operator ?netzbetreiber ?webseite { 
      ?operator a schema:Organization ;
      schema:name ?netzbetreiber .
      OPTIONAL {
      	?operator schema:url ?webseite .
      }
    }
  }
  
    {
    SELECT (MAX(?year) AS ?latestYear) {
      ?obs strom:period ?year .
    }
  }
  
   <https://energy.ld.admin.ch/elcom/electricityprice> a cube:Cube ;
    cube:observationSet/cube:observation ?obs .
  
    ?obs strom:period "${period}"^^xsd:gYear ; 
       strom:municipality ?municipality;
    strom:operator ?operator .

  
  
} ORDER BY ?netzbetreiber ?gemeindeNummer

        `
  );

  const resp = await fetch("https://lindas-cached.cluster.ldbar.ch/query", {
    method: "POST",
    body: sp.toString(),
    headers: {
      Accept: "application/sparql-results+json,*/*;q=0.9",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const json = (await resp.json()) as unknown as SparqlResponse;

  const bindings = json.results.bindings;
  const data = bindings.map((mv) => mapValues(mv, (x) => x.value));
  fs.writeFileSync("/tmp/data.json", JSON.stringify(data, null, 2));
  return z.array(MunicipalityInfo).parse(data);
};

const handler: NextApiHandler = async (req, res) => {
  const period = Number(
    req.query.period?.toString() ?? buildEnv.CURRENT_PERIOD
  );
  const data = await fetchMunicipalitiesInfo(period);
  const filename = `municipalities-data-${period}.csv`;
  const csv = csvFormat(data, [
    "operator",
    "website",
    "municipalityNumber",
    "municipalityName",
    "postalCode",
    "canton",
  ]);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment;filename=${filename}`);
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate"
  );
  res.send(csv);
};

export default handler;
