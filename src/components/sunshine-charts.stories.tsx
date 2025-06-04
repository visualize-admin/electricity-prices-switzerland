import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Card,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Decorator, Meta } from "@storybook/react";
import { Axis } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { MarkerCircle } from "@visx/marker";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { TooltipWithBounds, defaultStyles, useTooltip } from "@visx/tooltip";
import { sortBy } from "lodash";
import React, { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { z } from "zod";

const ErrorComponent = ({ message }: { message: string }) => (
  <div style={{ color: "red", fontWeight: 700 }}>
    <p>Error: {message}</p>
  </div>
);

const SPARQL_ENDPOINT = "https://test.lindas.admin.ch/query"; // Global SPARQL endpoint

const indicatorPredicates = {
  period: {
    predicate: "sunshine:period",
    binding: "?period",
    order: 0,
  },
  info: {
    predicate: "sunshine:info",
    binding: "?info",
    order: 1,
  },
  in_time: {
    predicate: "sunshine:in_time",
    binding: "?in_time",
    order: 2,
  },
  saifi_unplanned: {
    predicate: "sunshine:saifi_unplanned",
    binding: "?saifi_unplanned",
    order: 3,
  },
  saidi_total: {
    predicate: "sunshine:saidi_total",
    binding: "?saidi_total",
    order: 4,
  },
  saidi_unplanned: {
    predicate: "sunshine:saidi_unplanned",
    binding: "?saidi_unplanned",
    order: 5,
  },
  gridcost_ne5: {
    predicate: "sunshine:gridcost_ne5",
    binding: "?gridcost_ne5",
    order: 6,
  },
  gridcost_ne6: {
    predicate: "sunshine:gridcost_ne6",
    binding: "?gridcost_ne6",
    order: 7,
  },
  gridcost_ne7: {
    predicate: "sunshine:gridcost_ne7",
    binding: "?gridcost_ne7",
    order: 8,
  },
  products_choice: {
    predicate: "sunshine:products_choice",
    binding: "?products_choice",
    order: 9,
  },
  franken_regel: {
    predicate: "sunshine:franken_regel",
    binding: "?franken_regel",
    order: 10,
  },
  products_number: {
    predicate: "sunshine:products_number",
    binding: "?products_number",
    order: 11,
  },
  // Add other indicators as needed
};

// The following indicators would only be available when selecting a category,
// inside the sunshine-cat cube
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const indicatorCategoryPredicates = {
  energy_c3: {
    predicate: "sunshine:energy_c3",
    binding: "?energy_c3",
  },
  energy_c2: {
    predicate: "sunshine:energy_c2",
    binding: "?energy_c2",
  },
  energy_c4: {
    predicate: "sunshine:energy_c4",
    binding: "?energy_c4",
  },
  gridusage_c2: {
    predicate: "sunshine:gridusage_c2",
    binding: "?gridusage_c2",
  },
  gridusage_c3: {
    predicate: "sunshine:gridusage_c3",
    binding: "?gridusage_c3",
  },
  gridusage_c4: {
    predicate: "sunshine:gridusage_c4",
    binding: "?gridusage_c4",
  },
};

type Indicator = keyof typeof indicatorPredicates;

const buildSparqlQuery = (operatorIri: string, indicators: Indicator[]) => {
  const selectedIndicators = indicators.map(
    (indicator) => indicatorPredicates[indicator]
  );

  return `
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX cube: <https://cube.link/>
  PREFIX sunshine: <https://energy.ld.admin.ch/elcom/sunshine/dimension/>

    SELECT ?period ${selectedIndicators
      .map((x) => x.binding)
      .join("\n")} WHERE {
      <https://energy.ld.admin.ch/elcom/sunshine/observation/> cube:observation ?obs .
      ?obs sunshine:operator <${operatorIri}> ;
           sunshine:period ?period ;
           ${selectedIndicators
             .map((x) => `${x.predicate} ${x.binding}`)
             .join("; \n")} .
    } ORDER BY ?period
  `;
};

const DeutschBoolean = z.string().transform((x) => {
  if (x === "Ja") return true;
  if (x === "Nein") return false;
  return undefined;
});

const ObservationSchema = z.object({
  period: z.number(),
  info: DeutschBoolean.optional(),
  saifi_unplanned: z.number().optional(),
  in_time: DeutschBoolean.optional(),

  // Maybe subjected to change, looks like a number in the data
  franken_regel: z.string().optional(),

  saidi_total: z.number().optional(),
  saidi_unplanned: z.number().optional(),

  // Costs only available when requesting the sunshine-cat cube
  energy_c3: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  energy_c2: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  energy_c4: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  gridusage_c2: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  gridusage_c3: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  gridusage_c4: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  gridcost_ne5: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  gridcost_ne6: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),
  gridcost_ne7: z
    .string()
    .transform((x) => parseFloat(x))
    .optional(),

  products_choice: DeutschBoolean.optional(),
  products_number: z.number().optional(),
});

type Observation = z.infer<typeof ObservationSchema>;

type NumericalDataPoint = { period: number; value: number | null };

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "white",
  color: "black",
  border: "1px solid gray",
  borderRadius: "4px",
  padding: "4px",
};

const SunshineNumericalChart = ({
  width,
  height,
  margins,
  chartData,
}: {
  width: number;
  height: number;
  margins: { top: number; left: number; right: number; bottom: number };
  chartData: NumericalDataPoint[];
  indicator: string;
}) => {
  const xScale = scaleLinear({
    domain: [chartData[0].period, chartData[chartData.length - 1].period],
    range: [0, width - margins.left - margins.right],
  });

  const yScale = scaleLinear({
    domain: [
      Math.min(...chartData.map((d) => d.value ?? 0)),
      Math.max(...chartData.map((d) => d.value ?? 0)),
    ],
    range: [height - margins.top - margins.bottom, 0],
  });

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip<NumericalDataPoint>();

  const handleMouseOver = (
    event: React.MouseEvent<SVGCircleElement>,
    d: NumericalDataPoint
  ) => {
    const coords = localPoint(event) || { x: 0, y: 0 };
    showTooltip({
      tooltipData: d,
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
    });
  };

  return (
    <>
      <svg width={width} height={height}>
        <MarkerCircle id="marker-circle" fill="#333" size={2} refX={2} />
        <Group top={margins.top} left={margins.left}>
          {/* Y-axis */}
          <Axis
            orientation="left"
            scale={yScale}
            numTicks={5}
            tickLength={5}
            stroke="gray"
            tickStroke="gray"
            tickLabelProps={() => ({
              fontSize: 10,
              textAnchor: "end",
              dy: "0.33em",
              dx: -4,
            })}
          />

          {/* X-axis */}
          <Axis
            orientation="bottom"
            scale={xScale}
            top={height - 50}
            numTicks={4}
            tickLength={5}
            stroke="gray"
            tickStroke="gray"
            tickFormat={(year) => `${year}`}
            tickLabelProps={() => ({
              fontSize: 10,
              textAnchor: "middle",
              dy: "0.71em",
            })}
          />

          {/* Data line */}
          <LinePath
            data={chartData}
            x={(d) => xScale(new Date(d.period)) || 0}
            y={(d) =>
              d.value !== undefined && d.value !== null ? yScale(d.value) : NaN
            }
            stroke="blue"
            strokeWidth={2}
          />

          {/* Data points */}
          {chartData.map(
            (d, i) =>
              d.value !== undefined &&
              d.value !== null && (
                <circle
                  key={i}
                  cx={xScale(new Date(d.period)) || 0}
                  cy={yScale(d.value)}
                  r={4}
                  fill="blue"
                  onMouseOver={(event) => handleMouseOver(event, d)}
                  onMouseOut={hideTooltip}
                />
              )
          )}
        </Group>
      </svg>
      {/* Tooltip */}
      {tooltipData && (
        // @ts-expect-error Mismatch of type, there is no problem
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div>
            <strong>Period:</strong> {tooltipData.period}
          </div>
          <div>
            <strong>Value:</strong> {tooltipData.value}
          </div>
        </TooltipWithBounds>
      )}
    </>
  );
};

const SunshineChartCard = ({
  indicator,
  chartData,
}: {
  indicator: string;
  chartData: NumericalDataPoint[];
}) => {
  const margins = {
    top: 20,
    left: 50,
    right: 20,
    bottom: 50,
  };

  return (
    <Card
      elevation={1}
      key={indicator}
      sx={{
        marginBottom: "20px",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <CardHeader title={indicator} />

      <div style={{ width: "100%", height: "180px" }}>
        <ParentSize>
          {({ width, height }) => (
            <SunshineNumericalChart
              width={width}
              height={height}
              margins={margins}
              chartData={chartData}
              indicator={indicator}
            />
          )}
        </ParentSize>
      </div>
    </Card>
  );
};

type RdfBinding = {
  value: string;
  datatype: string;
};

const parseRdfData = (data: RdfBinding) => {
  if (data.datatype === "http://www.w3.org/2001/XMLSchema#integer") {
    return parseInt(data.value, 10);
  } else if (data.datatype === "http://www.w3.org/2001/XMLSchema#float") {
    return parseFloat(data.value);
  } else if (data.datatype === "http://www.w3.org/2001/XMLSchema#boolean") {
    return data.value === "true";
  } else if (data.datatype === "http://www.w3.org/2001/XMLSchema#gYear") {
    return parseInt(data.value, 10);
  } else if (data.datatype === "http://www.w3.org/2001/XMLSchema#decimal") {
    return parseFloat(data.value);
  } else if (data.value === "https://cube.link/Undefined") {
    return undefined;
  }

  return data.value; // Fallback to string
};

const fetchObservations = async (query: string) => {
  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      accept: "application/sparql-results+json",
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();
  return data.results.bindings.map((binding: Record<string, RdfBinding>) => {
    const observation: Record<string, string | number | boolean | undefined> =
      {};
    Object.keys(indicatorPredicates).forEach((indicator) => {
      observation[indicator] = parseRdfData(binding[indicator]);
    });
    observation.period = Number(binding.period.value);
    return ObservationSchema.parse(observation);
  });
};

const OperatorSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  iri: z.string(),
});

type Operator = z.infer<typeof OperatorSchema>;

const buildOperatorsQuery = () => {
  return `
  PREFIX schema: <http://schema.org/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX cube: <https://cube.link/>
  PREFIX sunshine: <https://energy.ld.admin.ch/elcom/sunshine/dimension/>

  SELECT ?operator ?name ?identifier {
    {SELECT DISTINCT ?operator WHERE {
        <https://energy.ld.admin.ch/elcom/sunshine/observation/> cube:observation ?obs .
        ?obs sunshine:operator ?operator.
      }}
    ?operator schema:name ?name.
    ?operator schema:identifier ?identifier.
  } ORDER BY ?name
  `;
};

const fetchAllOperators = async (query: string): Promise<Operator[]> => {
  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      accept: "application/sparql-results+json",
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();
  return data.results.bindings.map((binding: Record<string, RdfBinding>) => {
    return OperatorSchema.parse({
      identifier: binding.identifier.value,
      name: binding.name.value,
      iri: binding.operator.value,
    });
  });
};

const ObservationsTable = ({
  observations,
  columns,
}: {
  observations: Observation[];
  columns: { Header: string; accessor: string }[];
}) => {
  if (!observations || observations.length === 0) {
    return <p>No observations data available.</p>;
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="observations table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.accessor}>{column.Header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {observations.map((observation, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {columns.map((column) => (
                <TableCell key={column.accessor}>
                  {/* Access data using the accessor key, ensuring type safety */}
                  {String(
                    observation[column.accessor as keyof Observation] ?? ""
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const chartIndicators = [
  "saidi_unplanned",
  "gridcost_ne5",
  "gridcost_ne6",
  "gridcost_ne7",
  "products_number",
] as const;

export const Template = () => {
  const [operator, setOperator] = useState<string | null>(
    "https://energy.ld.admin.ch/elcom/electricityprice/operator/84"
  );
  const indicators = Object.keys(indicatorPredicates) as Indicator[];

  const operatorsQuery = useMemo(() => {
    return buildOperatorsQuery();
  }, []);
  const {
    data: operators = [],
    error: operatorsError,
    isLoading: operatorsLoading,
  } = useQuery({
    queryKey: ["operators"],
    queryFn: () => {
      return fetchAllOperators(operatorsQuery);
    },
    retry: false,
    placeholderData: [],
  });

  const observationsQuery = useMemo(() => {
    const query = buildSparqlQuery(operator!, indicators);
    return query;
  }, [indicators, operator]);

  const {
    data: observations,
    error: observationsError,
    isLoading: observationsLoading,
  } = useQuery(
    ["observations", operator, JSON.stringify(indicators)],
    () => {
      return operator && fetchObservations(observationsQuery);
    },
    { enabled: !!operator, retry: false }
  );

  if (operatorsLoading) return <p>Loading operators...</p>;
  if (operatorsError)
    return <ErrorComponent message={(operatorsError as Error).message} />;

  return (
    <div
      style={{
        display: "grid",
        gap: "20px",
      }}
    >
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={operators}
        getOptionLabel={(option) => option.name}
        sx={{ width: 300 }}
        value={operators.find((op) => op.iri === operator) || null}
        onChange={(event: unknown, newValue: Operator | null) => {
          setOperator(newValue?.iri || null);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Select an operator" />
        )}
      />

      <Accordion>
        <AccordionSummary>Operator</AccordionSummary>
        <AccordionDetails>
          <pre>{JSON.stringify(operator)}</pre>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary>Observations query</AccordionSummary>
        <AccordionDetails>
          <pre>{observationsQuery}</pre>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary>Operators query</AccordionSummary>
        <AccordionDetails>
          <pre>{operatorsQuery}</pre>
        </AccordionDetails>
      </Accordion>

      {observationsLoading && <p>Loading observations...</p>}
      {observationsError ? (
        <ErrorComponent message={(observationsError as Error).message} />
      ) : null}

      <ObservationsTable
        observations={observations}
        columns={sortBy(
          Object.keys(indicatorPredicates),
          (k) =>
            indicatorPredicates[k as keyof typeof indicatorPredicates].order
        ).map((key) => ({
          Header: key,
          accessor: key,
        }))}
      />
      <div
        style={{
          display: "grid",
          // columns than are repeated and maximum 200px
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",

          // Rows are repeated and maximum 200px
          gridTemplateRows: "repeat(auto-fill, minmax(200px, 1fr))",
          columnGap: "1rem",
        }}
      >
        {observations && (
          <>
            {chartIndicators.map((indicator) =>
              observations.length > 0 ? (
                <SunshineChartCard
                  key={indicator}
                  indicator={indicator}
                  chartData={observations.map((obs: Observation) => ({
                    period: obs.period,
                    value: obs[indicator],
                  }))}
                />
              ) : null
            )}
          </>
        )}
      </div>
    </div>
  );
};

const withQueryClient: Decorator = (Story) => {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

export default {
  title: "Components/SunshineChart",
  component: SunshineNumericalChart,
  decorators: [withQueryClient],
} as Meta;
