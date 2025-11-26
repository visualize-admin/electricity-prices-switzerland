import fs from "fs";

import { csvFormat } from "d3";
import { mapValues } from "lodash";
import { NextApiHandler } from "next";
import { z } from "zod";

import { runtimeEnv } from "src/env/runtime";
import { contextFromAPIRequest } from "src/graphql/server-context";

const MunicipalityInfo = z
  .object({
    netzbetreiber: z.string(),
    webseite: z.string().optional(),
    gemeindeNummer: z.string(),
    gemeindeName: z.string(),
    netzbetreiberPlz: z.string(),
    netzbetreiberOrt: z.string(),
    netzbetreiberStrasse: z.string(),

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
    operatorPostalCode: x.netzbetreiberPlz,
    operatorAddress: `${x.netzbetreiberStrasse}, ${x.netzbetreiberOrt}`,
    municipalityName: x.gemeindeName,
    municipalityNumber: x.gemeindeNummer,
    website: x.webseite,
    canton: x.kanton,
  }));

type SparqlResponse = {
  results: {
    bindings: Record<string, { value: unknown }>[];
  };
};

const fetchMunicipalitiesInfo = async (
  sparqlEndpointUrl: string,
  year: number
) => {
  const sp = new URLSearchParams();
  const query = /* sparql */ `
  PREFIX schema: <http://schema.org/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX cube: <https://cube.link/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX strom: <https://energy.ld.admin.ch/elcom/electricityprice/dimension/>
  
  SELECT DISTINCT  ?netzbetreiber ?webseite ?netzbetreiberStrasse ?netzbetreiberPlz ?netzbetreiberOrt ?gemeindePlz ?gemeindeName ?gemeindeNummer ?kanton ?webseite
  
  FROM <https://lindas.admin.ch/elcom/electricityprice>
  FROM <https://lindas.admin.ch/territorial>
  FROM <https://lindas.admin.ch/fso/register>
  
  WHERE
  {
    {  
      SELECT ?operator ?netzbetreiber ?netzbetreiberStrasse ?netzbetreiberPlz ?netzbetreiberOrt ?webseite { 
        ?operator a schema:Organization ;
          schema:name ?netzbetreiber .
          OPTIONAL {
            ?operator schema:url ?webseite .
          }
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
      strom:operator ?operator .
  
    ?municipality schema:name ?gemeindeName ;
      schema:identifier ?gemeindeNummer ;
      schema:postalCode ?gemeindePlz ;
      schema:containedInPlace ?canton .
    
    ?canton a <https://schema.ld.admin.ch/Canton> ;
      schema:alternateName ?kanton .
  }
  ORDER BY ?gemeindeNummer ?kategorieName  
          `;

  sp.append("query", query);

  const resp = await fetch(sparqlEndpointUrl, {
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
    req.query.period?.toString() ?? runtimeEnv.CURRENT_PERIOD
  );
  const context = await contextFromAPIRequest(req);
  const sparqlEndpointUrl = context.sparqlClient.query.endpoint.endpointUrl;
  const data = await fetchMunicipalitiesInfo(sparqlEndpointUrl, period);
  const filename = `municipalities-data-${period}.csv`;
  const csv = csvFormat(data, [
    "operator",
    "website",
    "municipalityNumber",
    "municipalityName",
    "operatorAddress",
    "operatorPostalCode",
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
