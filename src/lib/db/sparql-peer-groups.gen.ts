import * as fs from "fs";
import * as path from "path";

import { keyBy } from "lodash";

import { stripNamespaceFromIri } from "src/rdf/namespace";
import { sparqlClient } from "src/rdf/sparql-client";

interface PeerGroup {
  id: string;
  uri: string;
  names: {
    en?: string;
    de?: string;
    fr?: string;
    it?: string;
  };
}

async function generatePeerGroups() {
  const query = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX schema: <http://schema.org/>

        SELECT ?concept ?name ?lang WHERE {
            ?concept skos:inScheme <https://energy.ld.admin.ch/elcom/electricityprice/group> ;
                             schema:name ?name .
            BIND(LANG(?name) AS ?lang)
        }
        ORDER BY ?concept ?lang
    `;

  const endpoint = sparqlClient.query.endpoint.endpointUrl;

  // eslint-disable-next-line no-console
  console.log(`Fetching peer groups from SPARQL endpoint ${endpoint}`);
  const results = await sparqlClient.query.select(query);
  const groupsMap = new Map<string, PeerGroup>();

  for (const row of results) {
    const uri = row.concept.value;
    const id = stripNamespaceFromIri({ iri: uri });
    const name = row.name.value;
    const lang = row.lang.value;

    if (!groupsMap.has(id)) {
      groupsMap.set(id, { id, uri, names: {} });
    }

    const group = groupsMap.get(id)!;
    if (lang && ["en", "de", "fr", "it"].includes(lang)) {
      group.names[lang as keyof typeof group.names] = name;
    }
  }

  const peerGroups = Array.from(groupsMap.values());

  const outputPath = path.join(__dirname, "sparql-peer-groups.ts");
  const fileContent = `// Auto-generated file - do not edit manually
// Generated from SPARQL endpoint: ${endpoint}
// Run \`bun bun src/lib/db/sparql-peer-groups.gen.ts\` to update

export const peerGroups: Record<string, PeerGroup> = ${JSON.stringify(
    keyBy(peerGroups, "id"),
    null,
    2
  )} as const;

type PeerGroup = {
    id: string;
    uri: string;
    names: {
        en?: string;
        de?: string;
        fr?: string;
        it?: string;
    };
};
`;

  fs.writeFileSync(outputPath, fileContent, "utf-8");

  // eslint-disable-next-line no-console
  console.log(
    `Generated ${peerGroups.length} peer groups in sparql-peer-groups.ts`
  );
}

generatePeerGroups().catch(console.error);
