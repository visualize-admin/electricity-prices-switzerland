import ParsingClient from "sparql-http-client/ParsingClient";

import { ElectricityCategory } from "src/domain/data";
import { NetworkLevel, SunshineIndicator } from "src/domain/sunshine";
import {
  PeerGroup,
  SunshineDataIndicatorRow,
  SunshineDataRow,
} from "src/graphql/resolver-types";
import { getFieldName } from "src/lib/db/common";
import {
  PeerGroupNotFoundError,
  UnknownPeerGroupError,
} from "src/lib/db/errors";
import { peerGroupMapping } from "src/lib/db/sparql-peer-groups-mapping";
import { IndicatorMedianParams } from "src/lib/sunshine-data";
import type {
  NetworkCostRecord,
  OperationalStandardRecord,
  OperatorDataRecord,
  PeerGroupRecord,
  StabilityMetricRecord,
  SunshineDataService,
  TariffRecord,
} from "src/lib/sunshine-data-service";
import { addNamespaceToID, stripNamespaceFromIri } from "src/rdf/namespace";

// SPARQL client configuration
const client = new ParsingClient({
  endpointUrl: "https://test.lindas.admin.ch/query",
});

const yesPredicateValue =
  "https://energy.ld.admin.ch/elcom/electricityprice/Yes";

// Helper function to execute SPARQL queries
const executeSparqlQuery = async <T>(query: string): Promise<T[]> => {
  try {
    const stream = await client.query.select(query);
    const results: T[] = [];

    for await (const row of stream) {
      // Extract .value from each property in the row
      const extractedRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        extractedRow[key] =
          "datatype" in value &&
          value.datatype.value === "https://cube.link/Undefined"
            ? undefined
            : value && typeof value === "object" && "value" in value
            ? value.value
            : value;
      }
      results.push(extractedRow as T);
    }

    return results;
  } catch (error) {
    console.error("SPARQL query error:", error);
    throw error;
  }
};

// Helper functions for data conversion
const convertOperatorIdToUri = (operatorId: number): string => {
  return addNamespaceToID({ dimension: "operator", id: operatorId.toString() });
};

const extractOperatorIdFromUri = (uri: string): number => {
  return parseInt(stripNamespaceFromIri({ iri: uri }), 10);
};
const parseFloatOrUndefined = <T extends string | undefined>(
  value: T
): T extends string ? number : undefined => {
  return (
    value === undefined ? undefined : parseFloat(value)
  ) as T extends string ? number : undefined;
};

const getNetworkCosts = async ({
  operatorId,
  period,
  networkLevel,
}: {
  operatorId?: number;
  period?: number;
  peerGroup?: string;
  networkLevel?: NetworkLevel["id"];
} = {}): Promise<NetworkCostRecord[]> => {
  const operatorFilter = operatorId
    ? `:operator <${convertOperatorIdToUri(operatorId)}>`
    : "";
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  // For network costs, we need to query the main sunshine cube
  // and extract the specific network level cost
  const networkLevelProperty = networkLevel
    ? `:gridcost_${networkLevel.toLowerCase()}`
    : "";

  const values = `
    ${
      operatorId
        ? `VALUES ?operator { <${convertOperatorIdToUri(operatorId!)}> } `
        : ""
    }
    ${period ? `VALUES ?period { "${period.toString()}" } ` : ""}
    ${networkLevel ? `VALUES ?networkLevel { "${networkLevel}" } ` : ""}
`;

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?operator_name ?period ${
      networkLevel
        ? `?gridcost_${networkLevel.toLowerCase()}`
        : "?gridcost_ne5 ?gridcost_ne6 ?gridcost_ne7"
    }
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        ${
          networkLevel
            ? `${networkLevelProperty} ?gridcost_${networkLevel.toLowerCase()}`
            : `
        :gridcost_ne5 ?gridcost_ne5 ;
        :gridcost_ne6 ?gridcost_ne6 ;
        :gridcost_ne7 ?gridcost_ne7`
        } .
      ${
        operatorFilter
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
      
      ?operator schema:name ?operator_name .
    }
    ORDER BY DESC(?period) ?operator
  `;

  const results = await executeSparqlQuery<{
    operator: string;
    operator_name: string;
    period: string;
    gridcost_ne5?: string;
    gridcost_ne6?: string;
    gridcost_ne7?: string;
  }>(query);

  const networkCosts: NetworkCostRecord[] = [];

  for (const row of results) {
    const operatorId = extractOperatorIdFromUri(row.operator);
    const year = parseInt(row.period, 10);
    const operatorName = row.operator_name;

    // Convert the SPARQL results to NetworkCostRecord format
    if (networkLevel) {
      const rateKey =
        `gridcost_${networkLevel.toLowerCase()}` as keyof typeof row;
      const rate = row[rateKey];
      if (rate) {
        networkCosts.push({
          operator_id: operatorId,
          operator_name: operatorName,
          year,
          network_level: networkLevel,
          rate: parseFloatOrUndefined(rate),
        });
      }
    } else {
      // Return all network levels
      const levels: Array<{ level: NetworkLevel["id"]; rate?: string }> = [
        { level: "NE5", rate: row.gridcost_ne5 },
        { level: "NE6", rate: row.gridcost_ne6 },
        { level: "NE7", rate: row.gridcost_ne7 },
      ];

      for (const { level, rate } of levels) {
        if (rate) {
          networkCosts.push({
            operator_id: operatorId,
            operator_name: operatorName,
            year,
            network_level: level,
            rate: parseFloatOrUndefined(rate),
          });
        }
      }
    }
  }

  return networkCosts;
};

const getOperationalStandards = async ({
  operatorId,
  period,
}: {
  operatorId: number;
  period?: number;
}): Promise<OperationalStandardRecord[]> => {
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const values = period ? `VALUES ?period { "${period.toString()}" } ` : "";

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator_name ?period ?franken_regel ?info ?days_in_advance ?in_time
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator <${convertOperatorIdToUri(operatorId)}> ;
        ${periodFilter} ;
        :franken_regel ?franken_regel ;
        :info ?info ;
        :days_in_advance ?days_in_advance ;
        :in_time ?in_time .
      
      <${convertOperatorIdToUri(operatorId)}> schema:name ?operator_name .
    }
    ORDER BY DESC(?period)
  `;

  const results = await executeSparqlQuery<{
    operator_name: string;
    period: string;
    franken_regel: string;
    info: string;
    days_in_advance: string;
    in_time: string;
  }>(query);

  return results.map((row) => ({
    operator_id: operatorId,
    operator_name: row.operator_name,
    period: parseInt(row.period, 10),
    franc_rule: parseFloatOrUndefined(row.franken_regel),
    info_yes_no: row.info === "true" ? "ja" : "nein",
    info_days_in_advance: parseInt(row.days_in_advance, 10),
    timely: row.in_time === "true" ? 1 : 0,
    settlement_density: "", // TODO: Need to get this from operator data
    energy_density: "", // TODO: Need to get this from operator data
  }));
};

const getStabilityMetrics = async ({
  operatorId,
  period,
}: {
  operatorId?: number;
  period?: number;
  peerGroup?: string;
}): Promise<StabilityMetricRecord[]> => {
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const values = `
    ${
      operatorId
        ? `VALUES ?operator { <${convertOperatorIdToUri(operatorId!)}> } `
        : ""
    }
    ${period ? `VALUES ?period { "${period.toString()}" } ` : ""}
  `;

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?operator_name ?period ?saidi_total ?saidi_unplanned ?saifi_total ?saifi_unplanned
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        :saidi_total ?saidi_total ;
        :saidi_unplanned ?saidi_unplanned ;
        :saifi_total ?saifi_total ;
        :saifi_unplanned ?saifi_unplanned .
      ${
        operatorId
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
      
      ?operator schema:name ?operator_name .
    }
    ORDER BY DESC(?period) ?operator
  `;

  const results = await executeSparqlQuery<{
    operator: string;
    operator_name: string;
    period: string;
    saidi_total: string;
    saidi_unplanned: string;
    saifi_total: string;
    saifi_unplanned: string;
  }>(query);

  return results.map((row) => ({
    operator_id: extractOperatorIdFromUri(row.operator),
    operator_name: row.operator_name,
    period: parseInt(row.period, 10),
    saidi_total: parseFloatOrUndefined(row.saidi_total),
    saidi_unplanned: parseFloatOrUndefined(row.saidi_unplanned),
    saifi_total: parseFloatOrUndefined(row.saifi_total),
    saifi_unplanned: parseFloatOrUndefined(row.saifi_unplanned),
  }));
};

const getTariffs = async ({
  operatorId,
  period,
  category,
  tariffType,
}: {
  operatorId?: number;
  period?: number;
  category?: ElectricityCategory;
  tariffType?: "network" | "energy";
  peerGroup?: string;
} = {}): Promise<TariffRecord[]> => {
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;
  const categoryFilter = category
    ? `:category <${addNamespaceToID({ dimension: "category", id: category })}>`
    : `:category ?category`;

  const values = `
    ${
      operatorId
        ? `VALUES ?operator { <${convertOperatorIdToUri(operatorId!)}> } `
        : ""
    }
    ${period ? `VALUES ?period { "${period.toString()}" } ` : ""}
    ${
      category
        ? `VALUES ?category { <${addNamespaceToID({
            dimension: "category",
            id: category,
          })}> } `
        : ""
    }
  `;

  // Query the sunshine-cat cube for tariff data
  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?operator_name ?period ?category ?energy ?gridusage
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine-cat> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        ${categoryFilter} ;
        :energy ?energy ;
        :gridusage ?gridusage .
      ${
        operatorId
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
      
      ?operator schema:name ?operator_name .
    }
    ORDER BY DESC(?period) ?operator ?category
  `;

  const results = await executeSparqlQuery<{
    operator: string;
    operator_name: string;
    period: string;
    category: string;
    energy: string;
    gridusage: string;
  }>(query);

  const tariffs: TariffRecord[] = [];

  for (const row of results) {
    const operatorId = extractOperatorIdFromUri(row.operator);
    const periodValue = parseInt(row.period, 10);
    const categoryValue = stripNamespaceFromIri({ iri: row.category });
    const operatorName = row.operator_name;

    // Add energy tariff if requested or no specific type requested
    if (!tariffType || tariffType === "energy") {
      tariffs.push({
        operator_id: operatorId,
        operator_name: operatorName,
        period: periodValue,
        category: categoryValue as ElectricityCategory,
        tariff_type: "energy",
        rate: parseFloatOrUndefined(row.energy),
      });
    }

    // Add network tariff if requested or no specific type requested
    if (!tariffType || tariffType === "network") {
      tariffs.push({
        operator_id: operatorId,
        operator_name: operatorName,
        period: periodValue,
        category: categoryValue as ElectricityCategory,
        tariff_type: "network",
        rate: parseFloatOrUndefined(row.gridusage),
      });
    }
  }

  return tariffs;
};

const getOperatorData = async (
  operatorId: number,
  period: number
): Promise<OperatorDataRecord> => {
  // For now, we'll need to query sunshine data to get basic operator info
  // In a real implementation, there might be a separate operator metadata cube
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const values = period ? `VALUES ?period { "${period.toString()}" } ` : "";

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator_name ?period ?peerGroup
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator <${convertOperatorIdToUri(operatorId)}> ;
        :group ?peerGroup ;
        ${periodFilter} .
      
      <${convertOperatorIdToUri(operatorId)}> schema:name ?operator_name .
    }
    ORDER BY DESC(?period)
    LIMIT 1
  `;

  const results = await executeSparqlQuery<{
    operator_name: string;
    period: string;
    peerGroup: string;
  }>(query);

  if (results.length === 0) {
    throw new PeerGroupNotFoundError(operatorId);
  }

  const result = results[0];

  const peerGroup =
    peerGroupMapping[stripNamespaceFromIri({ iri: result.peerGroup })];

  return {
    operator_id: operatorId,
    operator_uid: operatorId.toString(), // TODO: Get actual UID
    operator_name: result.operator_name,
    period: parseInt(result.period, 10),
    settlement_density: peerGroup.settlement_density,
    energy_density: peerGroup.energy_density,
    peer_group: `${peerGroup.settlement_density}-${peerGroup.energy_density}`,
  };
};

const getYearlyIndicatorMedians = async <
  Metric extends IndicatorMedianParams["metric"]
>(
  params: IndicatorMedianParams
) => {
  const { peerGroup, metric, period } = params;
  const periodPredicate = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const periodValues = period
    ? `VALUES ?period { "${period.toString()}" } `
    : "";

  // Handle optional peer group
  const peerGroupValues = peerGroup
    ? `VALUES ?group { <https://energy.ld.admin.ch/elcom/electricityprice/group/${peerGroup}> }`
    : "VALUES ?group { <https://cube.link/Undefined> }";

  const peerGroupPredicate = `:group ?group ;`;

  // Query the median cubes based on the metric type
  let query = "";
  let cube = "";

  switch (metric) {
    case "network_costs": {
      const { networkLevel } = params;
      cube = "<https://energy.ld.admin.ch/elcom/sunshine-median>";
      query = `
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX cube: <https://cube.link/>
        PREFIX schema: <http://schema.org/>
        PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
        
        SELECT ?period ?group ?gridcost_${networkLevel?.toLowerCase()}
        WHERE {
         ${peerGroupValues}
          ${cube} cube:observationSet/cube:observation ?obs .

          ${periodValues}
          ?obs
            ${peerGroupPredicate}
            ${periodPredicate} ;
            :gridcost_${networkLevel?.toLowerCase()} ?gridcost_${networkLevel?.toLowerCase()} .
          
        }
      `;
      break;
    }

    case "stability":
      cube = "<https://energy.ld.admin.ch/elcom/sunshine-median>";
      query = `
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX cube: <https://cube.link/>
        PREFIX schema: <http://schema.org/>
        PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
        
        SELECT ?period ?group ?saidi_total ?saidi_unplanned ?saifi_total ?saifi_unplanned
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
         ${peerGroupValues}

          ${periodValues}
          ?obs
            ${peerGroupPredicate}
            ${periodPredicate} ;
            :saidi_total ?saidi_total ;
            :saidi_unplanned ?saidi_unplanned ;
            :saifi_total ?saifi_total ;
            :saifi_unplanned ?saifi_unplanned .
          
        }
      `;
      break;

    case "operational":
      cube = "<https://energy.ld.admin.ch/elcom/sunshine-median>";
      query = `
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX cube: <https://cube.link/>
        PREFIX schema: <http://schema.org/>
        PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
        
        SELECT ?period ?group ?franken_regel ?days_in_advance ?in_time
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
          ${peerGroupValues}

          ${periodValues}
          ?obs
            ${peerGroupPredicate}
            ${periodPredicate} ;
            :franken_regel ?franken_regel ;
            :days_in_advance ?days_in_advance
            .
        }
      `;
      break;

    case "energy-tariffs":
    case "net-tariffs": {
      const { category } = params;
      const isEnergy = metric === "energy-tariffs";
      cube = "<https://energy.ld.admin.ch/elcom/sunshine-cat-median>";
      query = `
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX cube: <https://cube.link/>
        PREFIX schema: <http://schema.org/>
        PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
        
        SELECT ?period ?group ?${isEnergy ? "energy" : "gridusage"}
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
         ${peerGroupValues}

          ${periodValues}
          ?obs
            ${peerGroupPredicate}
            ${periodPredicate} ;
            :category <${addNamespaceToID({
              dimension: "category",
              id: category!,
            })}> ;
            :${isEnergy ? "energy" : "gridusage"} ?${
        isEnergy ? "energy" : "gridusage"
      } .
          
        }
      `;
      break;
    }
  }

  if (!query) {
    throw new Error(`Unknown metric: ${metric}`);
  }

  const results = await executeSparqlQuery<{
    [key: string]: string;
  }>(query);
  if (results.length === 0) {
    return [];
  }

  const extractSpecific = (result: Record<string, string>) => {
    // Map results based on metric type
    switch (metric) {
      case "network_costs": {
        const { networkLevel } = params;
        const valueKey = `gridcost_${networkLevel?.toLowerCase()}`;
        return {
          network_level: networkLevel,
          median_value: parseFloatOrUndefined(result[valueKey] || "0"),
        } as PeerGroupRecord<Metric>;
      }

      case "stability":
        return {
          median_saidi_total: parseFloatOrUndefined(result.saidi_total || "0"),
          median_saidi_unplanned: parseFloatOrUndefined(
            result.saidi_unplanned || "0"
          ),
          median_saifi_total: parseFloatOrUndefined(result.saifi_total || "0"),
          median_saifi_unplanned: parseFloatOrUndefined(
            result.saifi_unplanned || "0"
          ),
        } as PeerGroupRecord<Metric>;

      case "operational":
        return {
          median_franc_rule: parseFloatOrUndefined(result.franken_regel || "0"),
          median_info_days: parseInt(result.days_in_advance || "0", 10),
          median_timely: result.in_time === "true" ? 1 : 0,
        } as PeerGroupRecord<Metric>;

      case "energy-tariffs": {
        const { category } = params;
        return {
          category,
          tariff_type: "energy",
          median_rate: parseFloatOrUndefined(result.energy || "0"),
        } as unknown as PeerGroupRecord<Metric>;
      }

      case "net-tariffs": {
        const { category } = params;
        return {
          category,
          tariff_type: "network",
          median_rate: parseFloatOrUndefined(result.gridusage || "0"),
        } as unknown as PeerGroupRecord<Metric>;
      }

      default: {
        const _check: never = metric;
        throw new Error(`Unhandled metric type: ${metric}`);
      }
    }
  };

  return results.map((r) => ({
    ...extractSpecific(r),
    period: parseInt(r.period || "0", 10),
    group: r.group || "unknown",
  }));
};

const getLatestYearSunshine = async (operatorId: number): Promise<number> => {
  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?period
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .
      ?obs
        :operator <${convertOperatorIdToUri(operatorId)}> ;
        :period ?period .
    }
    ORDER BY DESC(?period)
    LIMIT 1
  `;

  const results = await executeSparqlQuery<{
    period: string;
  }>(query);

  return results.length > 0 ? parseInt(results[0].period, 10) : 2024;
};

const getLatestYearPowerStability = async (
  operatorId: number
): Promise<string> => {
  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?period
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .
      ?obs
        :operator <${convertOperatorIdToUri(operatorId)}> ;
        :period ?period ;
        ?stabilityProperty ?stabilityValue .
      
      FILTER(?stabilityProperty IN (:saidi_total, :saidi_unplanned, :saifi_total, :saifi_unplanned))
      FILTER(BOUND(?stabilityValue))
    }
    ORDER BY DESC(?period)
    LIMIT 1
  `;

  const results = await executeSparqlQuery<{
    period: string;
  }>(query);

  return results.length > 0 ? results[0].period : "2024";
};

const getOperatorPeerGroup = async (
  _operatorId: number | string,
  period: number
): Promise<PeerGroup> => {
  const operatorId =
    typeof _operatorId === "number" ? _operatorId : parseInt(_operatorId, 10);
  // Get the group via a sparql query, the operator is bound
  // to a peer group via :group predicate
  const query = `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX cube: <https://cube.link/>
BASE <https://energy.ld.admin.ch/elcom/>

SELECT ?peerGroup
WHERE {
  ?peerGroup
    a <http://www.w3.org/2004/02/skos/core#Concept>.

  <sunshine> cube:observationSet/cube:observation ?obs .
  ?obs <sunshine/dimension/operator> <${convertOperatorIdToUri(operatorId)}> .
  ?obs <sunshine/dimension/period> "${period}"^^xsd:gYear.
  ?obs <sunshine/dimension/group> ?peerGroup .
} 
    LIMIT 1
  `;

  const results = await executeSparqlQuery<{
    peerGroup: string;
  }>(query);

  if (results.length === 0) {
    throw new PeerGroupNotFoundError(_operatorId);
  }
  const peerGroupUri = results[0].peerGroup;
  const peerGroupId = stripNamespaceFromIri({ iri: peerGroupUri })
    .slice(0, 1)
    .toUpperCase();
  if (!(peerGroupId in peerGroupMapping)) {
    throw new UnknownPeerGroupError(operatorId, peerGroupId);
  }
  const mapping = peerGroupMapping[peerGroupId];

  return {
    // TODO see when we have the correct attributes in Lindas
    settlementDensity: mapping.settlement_density,
    energyDensity: mapping.energy_density,
    id: `${peerGroupId}`,
  };
};

const getPeerGroups = async (
  locale: string
): Promise<
  {
    id: string;
    name: string;
    settlementDensity: string;
    energyDensity: string;
  }[]
> => {
  const query = `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX schema: <http://schema.org/>

    SELECT ?concept ?name WHERE {
        ?concept skos:inScheme <https://energy.ld.admin.ch/elcom/electricityprice/group> ;
                         schema:name ?name .
        FILTER(LANG(?name) = "${locale}")
    }
    ORDER BY ?concept
  `;

  const results = await executeSparqlQuery<{
    concept: string;
    name: string;
  }>(query);

  return results.map((row) => {
    const uri = row.concept;
    const id = stripNamespaceFromIri({ iri: uri });
    const mapping = peerGroupMapping[id];

    return {
      id,
      name: row.name,
      settlementDensity: mapping?.settlement_density || "",
      energyDensity: mapping?.energy_density || "",
    };
  });
};

const getSunshineData = async ({
  operatorId,
  period,
  peerGroup,
}: {
  operatorId?: number | undefined | null;
  period?: string | undefined | null;
  peerGroup?: string | undefined | null;
}): Promise<SunshineDataRow[]> => {
  const groupFilter =
    peerGroup !== "all_grid_operators" && peerGroup
      ? `:group <https://energy.ld.admin.ch/elcom/electricityprice/group/${peerGroup}>;`
      : "";
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const values = `
    ${
      operatorId
        ? `VALUES ?operator { <${convertOperatorIdToUri(operatorId!)}> } `
        : ""
    }
    ${period ? `VALUES ?period { "${period.toString()}" } ` : ""}
  `;

  // First, get main sunshine data
  const mainQuery = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?operator_name ?period ?gridcost_ne5 ?gridcost_ne6 ?gridcost_ne7 
           ?franken_regel ?info ?days_in_advance ?in_time ?saidi_total ?saidi_unplanned ?saifi_total ?saifi_unplanned
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        ${groupFilter}
        :gridcost_ne5 ?gridcost_ne5 ;
        :gridcost_ne6 ?gridcost_ne6 ;
        :gridcost_ne7 ?gridcost_ne7 ;
        :franken_regel ?franken_regel ;
        :info ?info ;
        :days_in_advance ?days_in_advance ;
        :in_time ?in_time ;
        :saidi_total ?saidi_total ;
        :saidi_unplanned ?saidi_unplanned ;
        :saifi_total ?saifi_total ;
        :saifi_unplanned ?saifi_unplanned .
      ${
        operatorId
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
      
      ?operator schema:name ?operator_name .
    }
    ORDER BY DESC(?period) ?operator
  `;

  // Get tariff data from the category cube
  const tariffQuery = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?period ?category ?energy ?gridusage
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine-cat> cube:observationSet/cube:observation ?obs .

      ${values}
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        :category ?category ;
        :energy ?energy ;
        :gridusage ?gridusage .
      ${
        operatorId
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
    }
    ORDER BY DESC(?period) ?operator ?category
  `;

  const [mainResults, tariffResults] = await Promise.all([
    executeSparqlQuery<{
      operator: string;
      operator_name: string;
      period: string;
      gridcost_ne5: string;
      gridcost_ne6: string;
      gridcost_ne7: string;
      franken_regel: string;
      info: string;
      days_in_advance: string;
      in_time: string;
      saidi_total: string;
      saidi_unplanned: string;
      saifi_total: string;
      saifi_unplanned: string;
    }>(mainQuery),
    executeSparqlQuery<{
      operator: string;
      period: string;
      category: string;
      energy: string;
      gridusage: string;
    }>(tariffQuery),
  ]);

  // Group tariff data by operator and period
  const tariffsByOperatorPeriod = new Map<
    string,
    Map<string, { energy: number; gridusage: number }>
  >();

  for (const row of tariffResults) {
    const operatorId = extractOperatorIdFromUri(row.operator);
    const period = row.period;
    const category = stripNamespaceFromIri({ iri: row.category });
    const key = `${operatorId}-${period}`;

    if (!tariffsByOperatorPeriod.has(key)) {
      tariffsByOperatorPeriod.set(key, new Map());
    }

    tariffsByOperatorPeriod.get(key)?.set(category, {
      energy: parseFloatOrUndefined(row.energy),
      gridusage: parseFloatOrUndefined(row.gridusage),
    });
  }

  // Combine main data with tariff data
  return mainResults.map((row) => {
    const operatorId = extractOperatorIdFromUri(row.operator);
    const period = row.period;
    const key = `${operatorId}-${period}`;
    const tariffs = tariffsByOperatorPeriod.get(key) || new Map();

    return {
      operatorId,
      operatorUID: operatorId.toString(), // TODO: Get actual UID
      name: row.operator_name,
      period,
      francRule: parseFloatOrUndefined(row.franken_regel),
      infoYesNo: row.info === yesPredicateValue,
      infoDaysInAdvance: parseInt(row.days_in_advance, 10),
      networkCostsNE5: parseFloatOrUndefined(row.gridcost_ne5),
      networkCostsNE6: parseFloatOrUndefined(row.gridcost_ne6),
      networkCostsNE7: parseFloatOrUndefined(row.gridcost_ne7),
      timely: row.in_time === "true",
      saidiTotal: parseFloatOrUndefined(row.saidi_total),
      saidiUnplanned: parseFloatOrUndefined(row.saidi_unplanned),
      saifiTotal: parseFloatOrUndefined(row.saifi_total),
      saifiUnplanned: parseFloatOrUndefined(row.saifi_unplanned),
      tariffEC2: tariffs.get("C2")?.energy || 0,
      tariffEC3: tariffs.get("C3")?.energy || 0,
      tariffEC4: tariffs.get("C4")?.energy || 0,
      tariffEC6: tariffs.get("C6")?.energy || 0,
      tariffEH2: tariffs.get("H2")?.energy || 0,
      tariffEH4: tariffs.get("H4")?.energy || 0,
      tariffEH7: tariffs.get("H7")?.energy || 0,
      tariffNC2: tariffs.get("C2")?.gridusage || 0,
      tariffNC3: tariffs.get("C3")?.gridusage || 0,
      tariffNC4: tariffs.get("C4")?.gridusage || 0,
      tariffNC6: tariffs.get("C6")?.gridusage || 0,
      tariffNH2: tariffs.get("H2")?.gridusage || 0,
      tariffNH4: tariffs.get("H4")?.gridusage || 0,
      tariffNH7: tariffs.get("H7")?.gridusage || 0,
    };
  });
};

const getSunshineDataByIndicator = async ({
  operatorId,
  period,
  peerGroup,
  indicator,
  category,
  networkLevel,
  saifiSaidiType,
}: {
  operatorId?: number | undefined | null;
  period?: string | undefined | null;
  peerGroup?: string | undefined | null;
  indicator: SunshineIndicator;
  category?: string;
  networkLevel?: string;
  saifiSaidiType?: string;
}): Promise<SunshineDataIndicatorRow[]> => {
  // Get the full data with peer group parameter (though SPARQL doesn't filter by it yet)
  const fullData = await getSunshineData({ operatorId, period, peerGroup });

  const fieldName = getFieldName(
    indicator,
    category,
    networkLevel,
    saifiSaidiType
  );

  // Extract only the value for the specified indicator and return minimal structure
  return fullData.map((row) => {
    // Get the value for the specified indicator field
    const value = row[fieldName as keyof typeof row] as number | undefined;

    return {
      operatorId: row.operatorId,
      operatorUID: row.operatorUID,
      name: row.name,
      period: row.period,
      value: value ?? null,
    };
  });
};

const fetchUpdateDate = async (): Promise<string> => {
  const query = `
    PREFIX schema: <http://schema.org/>
    
    SELECT ?dateModified
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> schema:dateModified ?dateModified .
    }
  `;

  const results = await executeSparqlQuery<{
    dateModified: string;
  }>(query);

  return results.length > 0
    ? results[0].dateModified
    : new Date().toISOString().split("T")[0];
};

export const sunshineDataServiceSparql = {
  name: "sparql",
  getNetworkCosts,
  getOperationalStandards,
  getStabilityMetrics,
  getTariffs,
  getOperatorData,
  getYearlyIndicatorMedians,
  getLatestYearSunshine,
  getLatestYearPowerStability,
  getOperatorPeerGroup,
  getPeerGroups,
  getSunshineData,
  getSunshineDataByIndicator,
  fetchUpdateDate,
} satisfies SunshineDataService;
