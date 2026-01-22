import { Box } from "@mui/material";
import React, { useEffect } from "react";

import { ComparisonData, ReleaseMetrics } from "src/admin-auth/metrics-types";

export type ChartProps = {
  comparisonData: ComparisonData[];
  releases: ReleaseMetrics[];
};

const GraphQLMetricsChart: React.FC<ChartProps> = ({
  comparisonData,
  releases,
}) => {
  useEffect(() => {
    // Only load D3 on client side
    if (typeof window === "undefined") return;

    // Dynamically import D3
    import("d3").then((d3) => {
      // Clear any existing chart
      d3.select("#chart").selectAll("*").remove();

      if (comparisonData.length === 0 || releases.length === 0) {
        return;
      }

      // Chart configuration
      const margin = { top: 20, right: 150, bottom: 60, left: 200 };
      const width = 1000 - margin.left - margin.right;
      const numReleases = releases.length;
      const itemHeight = 16;
      const height =
        Math.max(600, comparisonData.length * (itemHeight * numReleases)) -
        margin.top -
        margin.bottom;

      const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const maxTotal =
        d3.max(comparisonData, (d) => d3.max(d.releases, (dep) => dep.total)) ||
        0;

      const x = d3.scaleLinear().domain([0, maxTotal]).range([0, width]);

      const y = d3
        .scaleBand()
        .domain(comparisonData.map((d) => d.operation))
        .range([0, height])
        .padding(0.3);

      // Color scale for deployments
      const deploymentColor = d3
        .scaleOrdinal()
        .domain(releases.map((d) => d.release))
        .range(d3.schemeCategory10);

      const groupHeight = y.bandwidth();
      const barHeight = groupHeight / (numReleases + 0.5);
      // Tooltip
      const tooltip = d3.select("#tooltip");

      // Draw bars
      const groups = svg
        .selectAll(".operation-group")
        .data(comparisonData)
        .enter()
        .append("g")
        .attr("class", "operation-group")
        .attr("transform", (d) => `translate(0,${y(d.operation)})`);

      // For each operation, draw bars for each deployment
      comparisonData.forEach((opData, opIndex) => {
        const group = d3.select(groups.nodes()[opIndex]);

        opData.releases.forEach((depData, depIndex) => {
          const yOffset = depIndex * barHeight;
          const depGroup = group
            .append("g")
            .attr("transform", `translate(0, ${yOffset})`);

          // Cache hit (green)
          depGroup
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", x(depData.cacheHit))
            .attr("height", barHeight - 2)
            .attr("fill", "#22c55e")
            .attr("opacity", 0.8)
            .on("mouseover", function (event) {
              tooltip
                .style("opacity", 1)
                .html(
                  `
                  <div class="tooltip-title">${depData.release}</div>
                  <div class="tooltip-row">
                    <span>Operation:</span>
                    <strong>${opData.operation}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Hit:</span>
                    <strong>${depData.cacheHit}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Miss:</span>
                    <strong>${depData.cacheMiss}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Hit Rate:</span>
                    <strong>${(depData.hitRate * 100).toFixed(1)}%</strong>
                  </div>
                `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

          // Cache miss (red)
          depGroup
            .append("rect")
            .attr("x", x(depData.cacheHit))
            .attr("y", 0)
            .attr("width", x(depData.cacheMiss))
            .attr("height", barHeight - 2)
            .attr("fill", "#ef4444")
            .attr("opacity", 0.8)
            .on("mouseover", function (event) {
              tooltip
                .style("opacity", 1)
                .html(
                  `
                  <div class="tooltip-title">${depData.release}</div>
                  <div class="tooltip-row">
                    <span>Operation:</span>
                    <strong>${opData.operation}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Hit:</span>
                    <strong>${depData.cacheHit}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Miss:</span>
                    <strong>${depData.cacheMiss}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Hit Rate:</span>
                    <strong>${(depData.hitRate * 100).toFixed(1)}%</strong>
                  </div>
                `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

          // Deployment label on the right
          depGroup
            .append("text")
            .attr("x", width + 10)
            .attr("y", barHeight / 2)
            .attr("dy", "0.35em")
            .attr("font-size", "10px")
            .attr("fill", deploymentColor(depData.release) as string)
            .text(depData.release);
        });
      });

      // Axes
      const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.format("d"));
      const yAxis = d3.axisLeft(y);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#333")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .text("Number of Requests");

      svg.append("g").call(yAxis);
    });
  }, [comparisonData, releases]);

  return <Box id="chart" sx={{ my: 3, overflowX: "auto" }} />;
};

export default GraphQLMetricsChart;
