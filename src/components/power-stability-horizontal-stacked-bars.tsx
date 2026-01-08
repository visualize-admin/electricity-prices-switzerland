import { t } from "@lingui/macro";
import { max } from "d3";
import React, { useState, useMemo } from "react";

import {
  AnnotationX,
  AnnotationXLabel,
} from "src/components/charts-generic/annotation/annotation-x";
import { AxisHeightCategories } from "src/components/charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "src/components/charts-generic/axis/axis-width-linear";
import {
  BarsStacked,
  BarsStackedAxis,
} from "src/components/charts-generic/bars/bars-stacked";
import { StackedBarsChart } from "src/components/charts-generic/bars/bars-stacked-state";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
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

export const PowerStabilityHorizontalStackedBars = (
  props: Omit<PowerStabilityChartProps, "viewBy" | "observations"> & {
    observations: PowerStabilityRow[];
  }
) => {
  const { observations, id, operatorLabel, overallOrRatio } = props;
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
    >
      <SortOptions
        sortByItem={sortByItem}
        sortDirection={sortDirection}
        overallOrRatio={overallOrRatio}
        handleSortByItem={handleSortByItem}
      />
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear />
          <AxisHeightCategories hideXAxis highlightedCategory={operatorLabel} />
          <BarsStacked />
          <BarsStackedAxis />
          {overallOrRatio !== "ratio" && <AnnotationX />}
          <InteractionStackedBars />
        </ChartSvg>
        {overallOrRatio !== "ratio" && <AnnotationXLabel />}
        <Tooltip type="multiple" />
      </ChartContainer>
    </StackedBarsChart>
  );
};
