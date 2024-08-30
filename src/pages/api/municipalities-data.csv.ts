import fs from "fs";

import { csvFormat } from "d3";
import { mapValues } from "lodash";
import { NextApiHandler } from "next";
import { z } from "zod";

import buildEnv from "src/env/build";
import serverEnv from "src/env/server";

const MunicipalityInfo = z
  .object({
    netzbetreiber: z.string(),
    netzbetreiberStrasse: z.string(),
    netzbetreiberPlz: z.string(),
    netzbetreiberOrt: z.string(),

    gemeindeNummer: z.string().transform(Number),
    gemeindeName: z.string(),

    kategorieName: z.string(),
    total: z.string(),
    energie: z.string(),
    abgaben: z.string(),
    netznutzung: z.string(),
    netzzuschlag: z.string(),

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
    streetAddress: x.netzbetreiberStrasse,
    postalCode: x.netzbetreiberPlz,
    addressLocality: x.netzbetreiberOrt,
    gemeindeNummer: x.gemeindeNummer,
    gemeindeName: x.gemeindeName,
    categoryName: x.kategorieName,
    total: x.total,
    energy: x.energie,
    charge: x.abgaben,
    gridusage: x.netznutzung,
    aidfee: x.netzzuschlag,
    canton: x.kanton,
  }));

type SparqlResponse = {
  results: {
    bindings: Record<string, { value: unknown }>[];
  };
};

type MunicipalityInfo = z.infer<typeof MunicipalityInfo>;

const fetchMunicipalitiesInfo = async (year: number) => {
  const sp = new URLSearchParams();
  const query = /* sparql */ `
  PREFIX schema: <http://schema.org/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX cube: <https://cube.link/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX strom: <https://energy.ld.admin.ch/elcom/electricityprice/dimension/>
  
  SELECT ?netzbetreiber ?netzbetreiberStrasse ?netzbetreiberPlz ?netzbetreiberOrt ?gemeindeNummer ?gemeindeName ?kanton ?kategorieName ?total ?energie ?abgaben ?netznutzung ?netzzuschlag 
  
  FROM <https://lindas.admin.ch/elcom/electricityprice>
  FROM <https://lindas.admin.ch/territorial>
  FROM <https://lindas.admin.ch/fso/register>
  
  WHERE
  {
    {  
      SELECT ?operator ?netzbetreiber ?netzbetreiberStrasse ?netzbetreiberPlz ?netzbetreiberOrt { 
        ?operator a schema:Organization ;
          schema:name ?netzbetreiber .
        ?operator schema:address ?address .
        ?address schema:postalCode ?netzbetreiberPlz ;
          schema:streetAddress ?netzbetreiberStrasse ;
          schema:addressLocality ?netzbetreiberOrt .
      }
    }
    
    <https://energy.ld.admin.ch/elcom/electricityprice> a cube:Cube ;
      cube:observationSet/cube:observation ?obs .
    
    ?obs strom:period "${year}"^^xsd:gYear ; # Adjust here if you need another year
      strom:municipality ?municipality;
      strom:category ?category ;
      strom:product <https://energy.ld.admin.ch/elcom/electricityprice/product/standard> ;
      strom:total ?total ;
      strom:energy ?energie ;
      strom:charge ?abgaben ;
      strom:gridusage ?netznutzung ;
      strom:aidfee ?netzzuschlag ;
      strom:operator ?operator .
  
    ?municipality schema:name ?gemeindeName ;
      schema:identifier ?gemeindeNummer ;
      schema:containedInPlace ?canton .
    
    ?canton a <https://schema.ld.admin.ch/Canton> ;
      schema:alternateName ?kanton .
    
    ?category schema:name ?kategorieName .  
  }
  ORDER BY ?gemeindeNummer ?kategorieName  
          `;

  sp.append("query", query);

  const resp = await fetch(serverEnv.SPARQL_ENDPOINT, {
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
    "streetAddress",
    "postalCode",
    "addressLocality",
    "gemeindeNummer",
    "gemeindeName",
    "categoryName",
    "total",
    "energy",
    "charge",
    "gridusage",
    "aidfee",
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
