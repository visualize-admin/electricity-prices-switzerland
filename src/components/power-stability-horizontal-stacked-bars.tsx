import { t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { max } from "d3";
import { groupBy } from "lodash";
import React, { useState, useMemo } from "react";

import {
  AnnotationX,
  AnnotationXLabel,
} from "src/components/charts-generic/annotation/annotation-x";
import { AxisHeightCategories } from "src/components/charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "src/components/charts-generic/axis/axis-width-linear";
import {
  BarRowLine,
  MedianVerticalLine,
} from "src/components/charts-generic/bars/bar-row-line";
import {
  BarsStacked,
  BarsStackedAxis,
} from "src/components/charts-generic/bars/bars-stacked";
import { StackedBarsChart } from "src/components/charts-generic/bars/bars-stacked-state";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
import PlotArea from "src/components/charts-generic/dot-plot/plot-area";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import {
  PowerStabilityChartProps,
  PowerStabilityRow,
  PowerStabilitySortableType,
  SortOptions,
  InteractionStackedBars,
} from "src/components/power-stability-chart";
import { PERCENT, MIN_PER_YEAR } from "src/domain/metrics";
import { peerGroupOperatorName } from "src/domain/sunshine";
import { useIsMobile } from "src/lib/use-mobile";

export const PowerStabilityHorizontalStackedBars = (
  props: Omit<PowerStabilityChartProps, "viewBy" | "observations"> & {
    observations: PowerStabilityRow[];
    isMobile?: boolean;
  }
) => {
  const { observations, id, operatorLabel, overallOrRatio, isMobile: isMobileProp } = props;
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const [sortByItem, setSortByItem] =
    useState<PowerStabilitySortableType>("planned");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSortByItem = (item: PowerStabilitySortableType) => {
    if (sortByItem === item) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortByItem(item);
      setSortDirection("asc");
    }
  };

  const { dataWithRatioApplied, xDomain } = useMemo(() => {
    const data = observations.map((d) => {
      const total = d.planned + d.unplanned;
      if (overallOrRatio === "ratio" && total > 0) {
        return {
          ...d,
          planned: (d.planned / total) * 100,
          unplanned: (d.unplanned / total) * 100,
          total,
        };
      }
      return {
        ...d,
        total,
      };
    });

    const maxVal = max(data, (d) => d.planned + d.unplanned) ?? 0;
    const domain: [number, number] =
      overallOrRatio === "ratio" ? [0, 100] : [0, maxVal];

    return {
      dataWithRatioApplied: data,
      xDomain: domain,
      maxValue: maxVal,
    };
  }, [observations, overallOrRatio]);

  const { sortedDataWithoutMedian, medianPeerGroupObservation } =
    useMemo(() => {
      const sorted = [...dataWithRatioApplied].sort((a, b) => {
        if (a.operator_id.toString() === id) return -1;
        if (b.operator_id.toString() === id) return 1;

        switch (sortByItem) {
          case "operator":
            return a.operator_name.localeCompare(b.operator_name);
          case "planned":
            return b.planned - a.planned;
          case "unplanned":
            return b.unplanned - a.unplanned;
          case "total":
            return b.planned + b.unplanned - (a.planned + a.unplanned);
          default:
            return 0;
        }
      });

      if (sortDirection === "asc") {
        sorted.reverse();
      }

      // Move current operator to the top
      const currentOperatorIndex = sorted.findIndex(
        (d) => d.operator_id.toString() === id
      );
      if (currentOperatorIndex > -1) {
        const [currentOperator] = sorted.splice(currentOperatorIndex, 1);
        sorted.unshift(currentOperator);
      }

      const withoutMedian = sorted.filter(
        (d) => d.operator_name !== peerGroupOperatorName
      );
      const median = sorted.find(
        (d) => d.operator_name === peerGroupOperatorName
      );

      return {
        sortedDataWithoutMedian: withoutMedian,
        medianPeerGroupObservation: median,
      };
    }, [dataWithRatioApplied, sortByItem, sortDirection, id]);

  // Group data by operator name for mobile view
  const { dataByOperator, operatorsSorted } = useMemo(() => {
    if (!isMobile) return { dataByOperator: {}, operatorsSorted: [] };

    const grouped = groupBy(sortedDataWithoutMedian, (d) => d.operator_name);
    const sorted = sortedDataWithoutMedian.map((d) => d.operator_name);
    // Remove duplicates while preserving order
    const uniqueSorted = [...new Set(sorted)];

    return { dataByOperator: grouped, operatorsSorted: uniqueSorted };
  }, [isMobile, sortedDataWithoutMedian]);
  const rowHeight = 20;

  return (
    <StackedBarsChart
      data={sortedDataWithoutMedian}
      fields={{
        x: {
          componentIri: ["planned", "unplanned"],
          axisLabel: overallOrRatio === "ratio" ? PERCENT : MIN_PER_YEAR,
        },
        domain: xDomain,
        annotation: medianPeerGroupObservation
          ? [
              {
                value: medianPeerGroupObservation.total,
                avgLabel: t({
                  id: "legend-item.total-peer-group-median",
                  message: "Total (Peer Group Median)",
                }),
              },
            ]
          : [],
        y: {
          componentIri: "operator_name",
        },
        label: { componentIri: "avgLabel" },
        segment: {
          palette: "elcom",
          type: "stacked",
          componentIri: "unplanned",
        },
        style: {
          colorDomain: ["planned", "unplanned"],
          opacityDomain: [],
          colorAcc: "operator",
          opacityAcc: "year",
          highlightValue: id,
        },
      }}
      measures={[
        {
          iri: "planned",
          label: t({
            id: "power-stability-trend-chart.sortable-legend-item.planned",
            message: "Planned",
          }),
          __typename: "Measure",
        },
        {
          iri: "unplanned",
          label: t({
            id: "power-stability-trend-chart.sortable-legend-item.unplanned",
            message: "Unplanned",
          }),
          __typename: "Measure",
        },
      ]}
      dimensions={[
        {
          iri: "operator_name",
          label: "Operator",
          __typename: "NominalDimension",
        },
      ]}
      isMobile={isMobile}
    >
      <SortOptions
        sortByItem={sortByItem}
        sortDirection={sortDirection}
        overallOrRatio={overallOrRatio}
        handleSortByItem={handleSortByItem}
      />
      {isMobile ? (
        <Box position="relative" mt={2}>
          {operatorsSorted.map((operatorName) => {
            const rowData = dataByOperator[operatorName];
            const medianTotal = medianPeerGroupObservation?.total;
            const isHighlighted = operatorName === operatorLabel;

            return (
              <Box position="relative" key={operatorName}>
                <Box position="relative" top={24}>
                  <Tooltip type="multiple" forceYAnchor id={operatorName} />
                </Box>

                <Typography
                  variant="caption"
                  sx={{ fontWeight: isHighlighted ? "bold" : "normal", pl: 1 }}
                >
                  {operatorName}
                </Typography>
                <ChartSvg height={rowHeight} style={{ position: "static" }}>
                  <AxisWidthLinear format="number" />
                  <PlotArea>
                    <BarRowLine />
                    <BarsStacked data={rowData} />
                    {medianTotal !== undefined &&
                      overallOrRatio !== "ratio" && (
                        <MedianVerticalLine value={medianTotal} />
                      )}
                    <InteractionStackedBars id={operatorName} data={rowData} />
                  </PlotArea>
                </ChartSvg>
              </Box>
            );
          })}
        </Box>
      ) : (
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear />
            <AxisHeightCategories
              hideXAxis
              highlightedCategory={operatorLabel}
            />
            <PlotArea>
              <BarsStacked />
              <InteractionStackedBars />
            </PlotArea>
            {overallOrRatio !== "ratio" && <AnnotationX />}
            <BarsStackedAxis />
          </ChartSvg>
          <Tooltip type="multiple" />
          {overallOrRatio !== "ratio" && <AnnotationXLabel />}
        </ChartContainer>
      )}
    </StackedBarsChart>
  );
};
