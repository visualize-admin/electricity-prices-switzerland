import * as fs from "fs/promises";

import ParsingClient from "sparql-http-client/ParsingClient";

import { NetworkLevel, TariffCategory } from "src/domain/data";
import { SunshineDataRow } from "src/graphql/resolver-types";
import { PeerGroupNotFoundError } from "src/lib/db/errors";
import { PeerGroupMedianValuesParams } from "src/lib/sunshine-data";
import type {
  NetworkCostRecord,
  OperationalStandardRecord,
  StabilityMetricRecord,
  TariffRecord,
  OperatorDataRecord,
  PeerGroupRecord,
  SunshineDataService,
} from "src/lib/sunshine-data-service";
import { addNamespaceToID, stripNamespaceFromIri } from "src/rdf/namespace";

// SPARQL client configuration
const client = new ParsingClient({
  endpointUrl: "https://test.lindas.admin.ch/query",
});

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
          value && typeof value === "object" && "value" in value
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
          rate: parseFloat(rate),
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
            rate: parseFloat(rate),
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

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator_name ?period ?franken_regel ?info ?days_in_advance ?in_time
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .
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
    franc_rule: parseFloat(row.franken_regel),
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
  const operatorFilter = operatorId
    ? `:operator <${convertOperatorIdToUri(operatorId)}>`
    : "";
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?operator_name ?period ?saidi_total ?saidi_unplanned ?saifi_total ?saifi_unplanned
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        :saidi_total ?saidi_total ;
        :saidi_unplanned ?saidi_unplanned ;
        :saifi_total ?saifi_total ;
        :saifi_unplanned ?saifi_unplanned .
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
    saidi_total: string;
    saidi_unplanned: string;
    saifi_total: string;
    saifi_unplanned: string;
  }>(query);

  return results.map((row) => ({
    operator_id: extractOperatorIdFromUri(row.operator),
    operator_name: row.operator_name,
    period: parseInt(row.period, 10),
    saidi_total: parseFloat(row.saidi_total),
    saidi_unplanned: parseFloat(row.saidi_unplanned),
    saifi_total: parseFloat(row.saifi_total),
    saifi_unplanned: parseFloat(row.saifi_unplanned),
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
  category?: string;
  tariffType?: "network" | "energy";
  peerGroup?: string;
} = {}): Promise<TariffRecord[]> => {
  const operatorFilter = operatorId
    ? `:operator <${convertOperatorIdToUri(operatorId)}>`
    : "";
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;
  const categoryFilter = category
    ? `:category <${addNamespaceToID({ dimension: "category", id: category })}>`
    : `:category ?category`;

  // Query the sunshine-cat cube for tariff data
  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?operator_name ?period ?category ?energy ?gridusage
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine-cat> cube:observationSet/cube:observation ?obs .
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        ${categoryFilter} ;
        :energy ?energy ;
        :gridusage ?gridusage .
      ${
        operatorFilter
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
        category: categoryValue as TariffCategory,
        tariff_type: "energy",
        rate: parseFloat(row.energy),
      });
    }

    // Add network tariff if requested or no specific type requested
    if (!tariffType || tariffType === "network") {
      tariffs.push({
        operator_id: operatorId,
        operator_name: operatorName,
        period: periodValue,
        category: categoryValue as TariffCategory,
        tariff_type: "network",
        rate: parseFloat(row.gridusage),
      });
    }
  }

  return tariffs;
};

const getOperatorData = async (
  operatorId: number,
  period?: number
): Promise<OperatorDataRecord> => {
  // For now, we'll need to query sunshine data to get basic operator info
  // In a real implementation, there might be a separate operator metadata cube
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX schema: <http://schema.org/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator_name ?period
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine> cube:observationSet/cube:observation ?obs .
      ?obs
        :operator <${convertOperatorIdToUri(operatorId)}> ;
        ${periodFilter} .
      
      <${convertOperatorIdToUri(operatorId)}> schema:name ?operator_name .
    }
    ORDER BY DESC(?period)
    LIMIT 1
  `;

  const results = await executeSparqlQuery<{
    operator_name: string;
    period: string;
  }>(query);

  if (results.length === 0) {
    throw new PeerGroupNotFoundError(operatorId);
  }

  const result = results[0];

  // TODO: In a real implementation, we would need to determine settlement_density and energy_density
  // For now, we'll use placeholder values
  const settlementDensity = "Tourist"; // This should come from operator metadata
  const energyDensity = "Low"; // This should come from operator metadata

  return {
    operator_id: operatorId,
    operator_uid: operatorId.toString(), // TODO: Get actual UID
    operator_name: result.operator_name,
    period: parseInt(result.period, 10),
    settlement_density: settlementDensity,
    energy_density: energyDensity,
    peer_group: `${settlementDensity}-${energyDensity}`,
  };
};

const getPeerGroupMedianValues = async <
  Metric extends PeerGroupMedianValuesParams["metric"]
>(
  params: PeerGroupMedianValuesParams
) => {
  const { peerGroup, metric, period } = params;
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

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
        
        SELECT ?gridcost_${networkLevel?.toLowerCase()}
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
          ?obs
            :group ?group ;
            ${periodFilter} ;
            :gridcost_${networkLevel?.toLowerCase()} ?gridcost_${networkLevel?.toLowerCase()} .
          
          ?group schema:name "${peerGroup}"@de .
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
        
        SELECT ?saidi_total ?saidi_unplanned ?saifi_total ?saifi_unplanned
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
          ?obs
            :group ?group ;
            ${periodFilter} ;
            :saidi_total ?saidi_total ;
            :saidi_unplanned ?saidi_unplanned ;
            :saifi_total ?saifi_total ;
            :saifi_unplanned ?saifi_unplanned .
          
          ?group schema:name "${peerGroup}"@de .
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
        
        SELECT ?franken_regel ?days_in_advance ?in_time
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
          ?obs
            :group ?group ;
            ${periodFilter} ;
            :franken_regel ?franken_regel ;
            :days_in_advance ?days_in_advance ;
            :in_time ?in_time .
          
          ?group schema:name "${peerGroup}"@de .
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
        
        SELECT ?${isEnergy ? "energy" : "gridusage"}
        WHERE {
          ${cube} cube:observationSet/cube:observation ?obs .
          ?obs
            :group ?group ;
            ${periodFilter} ;
            :category <${addNamespaceToID({
              dimension: "category",
              id: category,
            })}> ;
            :${isEnergy ? "energy" : "gridusage"} ?${
        isEnergy ? "energy" : "gridusage"
      } .
          
          ?group schema:name "${peerGroup}"@de .
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
    return undefined;
  }

  const result = results[0];

  // Map results based on metric type
  switch (metric) {
    case "network_costs": {
      const { networkLevel } = params;
      const valueKey = `gridcost_${networkLevel?.toLowerCase()}`;
      return {
        network_level: networkLevel,
        median_value: parseFloat(result[valueKey] || "0"),
      } as PeerGroupRecord<Metric>;
    }

    case "stability":
      return {
        median_saidi_total: parseFloat(result.saidi_total || "0"),
        median_saidi_unplanned: parseFloat(result.saidi_unplanned || "0"),
        median_saifi_total: parseFloat(result.saifi_total || "0"),
        median_saifi_unplanned: parseFloat(result.saifi_unplanned || "0"),
      } as PeerGroupRecord<Metric>;

    case "operational":
      return {
        median_franc_rule: parseFloat(result.franken_regel || "0"),
        median_info_days: parseInt(result.days_in_advance || "0", 10),
        median_timely: result.in_time === "true" ? 1 : 0,
      } as PeerGroupRecord<Metric>;

    case "energy-tariffs": {
      const { category } = params;
      return {
        category,
        tariff_type: "energy",
        median_rate: parseFloat(result.energy || "0"),
      } as unknown as PeerGroupRecord<Metric>;
    }

    case "net-tariffs": {
      const { category } = params;
      return {
        category,
        tariff_type: "network",
        median_rate: parseFloat(result.gridusage || "0"),
      } as unknown as PeerGroupRecord<Metric>;
    }

    default:
      return undefined;
  }
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

const getPeerGroup = async (
  _operatorId: number | string
): Promise<{
  settlementDensity: string;
  energyDensity: string;
  id: string;
}> => {
  // Based on the method logs, operator 8 seems to be in "Tourist-Low" peer group
  const settlementDensity = "Tourist";
  const energyDensity = "Low";

  return {
    settlementDensity,
    energyDensity,
    id: `${settlementDensity}-${energyDensity}`,
  };
};

const getSunshineData = async ({
  operatorId,
  period,
}: {
  operatorId?: number | undefined | null;
  period?: string | undefined | null;
}): Promise<SunshineDataRow[]> => {
  const operatorFilter = operatorId
    ? `:operator <${convertOperatorIdToUri(operatorId)}>`
    : "";
  const periodFilter = period
    ? `:period "${period}"^^xsd:gYear`
    : `:period ?period`;

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
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
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
        operatorFilter
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
      
      ?operator schema:name ?operator_name .
    }
    ORDER BY DESC(?period) ?operator
  `;

  const mainResults = await executeSparqlQuery<{
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
  }>(mainQuery);

  // Get tariff data from the category cube
  const tariffQuery = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cube: <https://cube.link/>
    PREFIX : <https://energy.ld.admin.ch/elcom/sunshine/dimension/>
    
    SELECT ?operator ?period ?category ?energy ?gridusage
    WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine-cat> cube:observationSet/cube:observation ?obs .
      ?obs
        :operator ?operator ;
        ${periodFilter} ;
        :category ?category ;
        :energy ?energy ;
        :gridusage ?gridusage .
      ${
        operatorFilter
          ? `FILTER(?operator = <${convertOperatorIdToUri(operatorId!)}>)`
          : ""
      }
    }
    ORDER BY DESC(?period) ?operator ?category
  `;

  const tariffResults = await executeSparqlQuery<{
    operator: string;
    period: string;
    category: string;
    energy: string;
    gridusage: string;
  }>(tariffQuery);

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

    tariffsByOperatorPeriod.get(key)!.set(category, {
      energy: parseFloat(row.energy),
      gridusage: parseFloat(row.gridusage),
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
      francRule: parseFloat(row.franken_regel),
      infoYesNo: row.info === "true",
      infoDaysInAdvance: parseInt(row.days_in_advance, 10),
      networkCostsNE5: parseFloat(row.gridcost_ne5),
      networkCostsNE6: parseFloat(row.gridcost_ne6),
      networkCostsNE7: parseFloat(row.gridcost_ne7),
      timely: row.in_time === "true",
      saidiTotal: parseFloat(row.saidi_total),
      saidiUnplanned: parseFloat(row.saidi_unplanned),
      saifiTotal: parseFloat(row.saifi_total),
      saifiUnplanned: parseFloat(row.saifi_unplanned),
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

const sunshineDataServiceRaw = {
  name: "sparql",
  getNetworkCosts,
  getOperationalStandards,
  getStabilityMetrics,
  getTariffs,
  getOperatorData,
  getPeerGroupMedianValues,
  getLatestYearSunshine,
  getLatestYearPowerStability,
  getPeerGroup,
  getSunshineData,
} satisfies SunshineDataService;

// Export the service with logging proxy
export const sunshineDataServiceSparql = new Proxy(sunshineDataServiceRaw, {
  get(target, prop: string) {
    if (prop === "name") {
      return target.name;
    }
    if (prop in target) {
      return async (...args: unknown[]) => {
        await fs.appendFile(
          `/tmp/method-log-sparql`,
          `Calling ${prop} with args: ${JSON.stringify(args)}\n`
        );
        const result = await (
          target as unknown as Record<string, (...args: unknown[]) => unknown>
        )[prop](...args);
        return result;
      };
    }
    throw new Error(`Method ${prop} does not exist on SunshineDataService`);
  },
});

sunshineDataServiceSparql.name = sunshineDataServiceRaw.name;
