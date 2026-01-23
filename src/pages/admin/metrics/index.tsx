import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { schemeCategory10 } from "d3";
import { utcFormat } from "d3-time-format";
import { GetServerSideProps } from "next";
import { useEffect } from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import serverEnv from "src/env/server";
import {
  listDeploymentIds,
  getOperationMetricsByDeploymentId,
  OperationMetrics,
} from "src/lib/metrics/metrics-store";
import { getSentryClient } from "src/lib/metrics/sentry-client";

interface AggregatedOperationMetrics {
  requestCount: number;
  avgDurationMs: number;
  errorCount: number;
  errorRate: number;
  cacheHitRate: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

interface DeploymentMetrics {
  deploymentId: string;
  collectedAt: string;
  operations: Record<string, AggregatedOperationMetrics>;
}

interface ComparisonData {
  operation: string;
  deployments: Array<{
    deploymentId: string;
    cacheHit: number;
    cacheMiss: number;
    total: number;
    hitRate: number;
  }>;
}

interface SentryConfig {
  enabled: boolean;
  sampleRate: number;
  authTokenConfigured: boolean;
}

interface MetricsPageProps {
  deployments: DeploymentMetrics[];
  comparisonData: ComparisonData[];
  csrfToken: string;
  sentryConfig: SentryConfig;
}

function aggregateMetrics(
  rawMetrics: Record<string, OperationMetrics>
): Record<string, AggregatedOperationMetrics> {
  const aggregated: Record<string, AggregatedOperationMetrics> = {};

  for (const [operationName, metrics] of Object.entries(rawMetrics)) {
    const requestCount = metrics.requestCount || 0;
    const totalDurationMs = metrics.totalDurationMs || 0;
    const errorCount = metrics.errorCount || 0;
    const cacheHit = metrics.responseCacheHit || 0;
    const cacheMiss = metrics.responseCacheMiss || 0;
    const totalCacheRequests = cacheHit + cacheMiss;

    aggregated[operationName] = {
      requestCount,
      avgDurationMs: requestCount > 0 ? totalDurationMs / requestCount : 0,
      errorCount,
      errorRate: requestCount > 0 ? errorCount / requestCount : 0,
      cacheHitRate: totalCacheRequests > 0 ? cacheHit / totalCacheRequests : 0,
      responseCacheHit: cacheHit,
      responseCacheMiss: cacheMiss,
    };
  }

  return aggregated;
}

function prepareComparisonData(
  deployments: DeploymentMetrics[]
): ComparisonData[] {
  // Collect all unique operation names
  const allOperations = new Set<string>();
  deployments.forEach((deployment) => {
    Object.keys(deployment.operations).forEach((op) => allOperations.add(op));
  });

  // Build comparison data
  const comparisonData: ComparisonData[] = Array.from(allOperations).map(
    (operation) => {
      return {
        operation,
        deployments: deployments.map((deployment) => {
          const metrics = deployment.operations[operation] || {
            responseCacheHit: 0,
            responseCacheMiss: 0,
            cacheHitRate: 0,
          };
          const cacheHit = metrics.responseCacheHit;
          const cacheMiss = metrics.responseCacheMiss;
          const total = cacheHit + cacheMiss;

          return {
            deploymentId: deployment.deploymentId,
            cacheHit,
            cacheMiss,
            total,
            hitRate: metrics.cacheHitRate,
          };
        }),
      };
    }
  );

  // Filter out operations with zero total across all deployments
  const filtered = comparisonData.filter((item) =>
    item.deployments.some((d) => d.total > 0)
  );

  // Sort by total requests (descending)
  filtered.sort((a, b) => {
    const aTotal = a.deployments.reduce((sum, d) => sum + d.total, 0);
    const bTotal = b.deployments.reduce((sum, d) => sum + d.total, 0);
    return bTotal - aTotal;
  });

  return filtered;
}

const SentryConfigurationCard: React.FC<{
  sentryConfig: SentryConfig;
}> = ({ sentryConfig }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
    <Typography variant="h6" gutterBottom>
      Sentry Configuration
    </Typography>
    <Box sx={{ display: "flex", gap: 4, mb: 1 }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Tracing Status:
        </Typography>
        <Typography variant="body2" fontFamily="monospace">
          {sentryConfig.enabled ? "Enabled" : "Disabled"}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Sample Rate:
        </Typography>
        <Typography variant="body2" fontFamily="monospace">
          {(sentryConfig.sampleRate * 100).toFixed(0)}%
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Auth Token:
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          color={
            sentryConfig.authTokenConfigured ? "success.main" : "warning.main"
          }
        >
          {sentryConfig.authTokenConfigured ? "Configured" : "Not Configured"}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default function AdminMetricsPage({
  deployments,
  comparisonData,
  csrfToken,
  sentryConfig,
}: MetricsPageProps) {
  useEffect(() => {
    // Only load D3 on client side
    if (typeof window === "undefined") return;

    // Dynamically import D3
    import("d3").then((d3) => {
      // Clear any existing chart
      d3.select("#chart").selectAll("*").remove();

      if (comparisonData.length === 0 || deployments.length === 0) {
        return;
      }

      // Chart configuration
      const margin = { top: 20, right: 150, bottom: 60, left: 200 };
      const width = 1000 - margin.left - margin.right;
      const numDeployments = deployments.length;
      const itemHeight = 16;
      const height =
        Math.max(600, comparisonData.length * (itemHeight * numDeployments)) -
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
        d3.max(comparisonData, (d) =>
          d3.max(d.deployments, (dep) => dep.total)
        ) || 0;

      const x = d3.scaleLinear().domain([0, maxTotal]).range([0, width]);

      const y = d3
        .scaleBand()
        .domain(comparisonData.map((d) => d.operation))
        .range([0, height])
        .padding(0.3);

      // Color scale for deployments
      const deploymentColor = d3
        .scaleOrdinal()
        .domain(deployments.map((d) => d.deploymentId))
        .range(d3.schemeCategory10);

      const groupHeight = y.bandwidth();
      const barHeight = groupHeight / (numDeployments + 0.5);

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

        opData.deployments.forEach((depData, depIndex) => {
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
                  <div class="tooltip-title">${depData.deploymentId}</div>
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
                  <div class="tooltip-title">${depData.deploymentId}</div>
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
            .attr("fill", deploymentColor(depData.deploymentId) as string)
            .text(depData.deploymentId);
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
  }, [comparisonData, deployments]);

  if (deployments.length === 0) {
    return (
      <AdminLayout
        title="GraphQL Metrics Dashboard"
        csrfToken={csrfToken}
        breadcrumbs={[
          { label: "Admin", href: "/admin/session-config" },
          { label: "Metrics" },
        ]}
      >
        <SentryConfigurationCard sentryConfig={sentryConfig} />
        <Typography color="text.secondary">
          No metrics found in Redis
        </Typography>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="GraphQL Metrics Dashboard"
      csrfToken={csrfToken}
      breadcrumbs={[
        { label: "Admin", href: "/admin/session-config" },
        { label: "Metrics" },
      ]}
    >
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Deployment Comparison - Cache Hit/Miss Analysis
      </Typography>

      {/* Deployments Metadata */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          Deployments ({deployments.length})
        </Typography>
        {deployments.map((deployment) => (
          <Box
            key={deployment.deploymentId}
            sx={{ display: "flex", gap: 4, mb: 1 }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Deployment ID:
              </Typography>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{ wordBreak: "break-all" }}
              >
                {deployment.deploymentId}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Collected:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {utcFormat("%Y-%m-%d %H:%M:%S")(
                  new Date(deployment.collectedAt)
                )}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Redis Configuration */}
      <SentryConfigurationCard sentryConfig={sentryConfig} />

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Chip label="Cache Hit" sx={{ bgcolor: "#22c55e", color: "white" }} />
        <Chip label="Cache Miss" sx={{ bgcolor: "#ef4444", color: "white" }} />
        {deployments.map((deployment, index) => (
          <Chip
            key={deployment.deploymentId}
            label={deployment.deploymentId}
            sx={{
              bgcolor: schemeCategory10[index % schemeCategory10.length],
              color: "white",
            }}
          />
        ))}
      </Box>

      {/* D3 Chart */}
      <Box id="chart" sx={{ my: 3, overflowX: "auto" }} />

      {/* Detailed Comparison Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Detailed Comparison
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Operation</TableCell>
              {deployments.map((deployment) => (
                <TableCell
                  key={deployment.deploymentId}
                  colSpan={3}
                  align="center"
                  sx={{ borderLeft: "2px solid", borderLeftColor: "divider" }}
                >
                  {deployment.deploymentId}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell />
              {deployments.map((deployment) => (
                <>
                  <TableCell
                    key={`${deployment.deploymentId}-hits`}
                    align="right"
                    sx={{ borderLeft: "2px solid", borderLeftColor: "divider" }}
                  >
                    Hits
                  </TableCell>
                  <TableCell
                    key={`${deployment.deploymentId}-misses`}
                    align="right"
                  >
                    Misses
                  </TableCell>
                  <TableCell
                    key={`${deployment.deploymentId}-rate`}
                    align="right"
                  >
                    Hit Rate
                  </TableCell>
                </>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonData.map((item) => (
              <TableRow key={item.operation} hover>
                <TableCell>{item.operation}</TableCell>
                {item.deployments.map((dep) => (
                  <>
                    <TableCell
                      key={`${dep.deploymentId}-hits`}
                      align="right"
                      sx={{
                        fontFamily: "monospace",
                        borderLeft: "2px solid",
                        borderLeftColor: "divider",
                      }}
                    >
                      {dep.cacheHit}
                    </TableCell>
                    <TableCell
                      key={`${dep.deploymentId}-misses`}
                      align="right"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {dep.cacheMiss}
                    </TableCell>
                    <TableCell
                      key={`${dep.deploymentId}-rate`}
                      align="right"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {(dep.hitRate * 100).toFixed(1)}%
                    </TableCell>
                  </>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tooltip for D3 chart */}
      <Box
        id="tooltip"
        sx={{
          position: "absolute",
          p: 1.5,
          bgcolor: "rgba(0, 0, 0, 0.9)",
          color: "white",
          borderRadius: 1,
          fontSize: "0.85rem",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.2s",
          zIndex: 1000,
          maxWidth: 300,
          "& .tooltip-title": {
            fontWeight: 600,
            mb: 1,
          },
          "& .tooltip-row": {
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mb: 0.5,
          },
        }}
      />
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps<MetricsPageProps> = async (
  context
) => {
  // Get session for CSRF token (auth is handled by middleware)
  const session = await parseSessionFromRequest(context.req);
  const csrfToken = session ? generateCSRFToken(session.sessionId) : "";

  // Get Sentry configuration
  const sentryClient = getSentryClient();
  const sentryConfig: SentryConfig = {
    enabled: serverEnv.NODE_ENV === "production",
    sampleRate:
      serverEnv.SENTRY_TRACES_SAMPLE_RATE ??
      (serverEnv.NODE_ENV === "production"
        ? serverEnv.VERCEL_DEPLOYMENT_ID
          ? 1.0
          : 0.1
        : 1.0),
    authTokenConfigured: sentryClient.isConfigured(),
  };

  try {
    // Fetch all deployment IDs
    const deploymentIds = await listDeploymentIds();

    // Fetch metrics for each deployment
    const deployments: DeploymentMetrics[] = [];
    for (const deploymentId of deploymentIds) {
      const rawMetrics = await getOperationMetricsByDeploymentId(deploymentId);
      const operations = aggregateMetrics(rawMetrics);

      deployments.push({
        deploymentId,
        collectedAt: new Date().toISOString(),
        operations,
      });
    }

    // Sort deployments by ID (most recent first, assuming timestamp-based IDs)
    deployments.sort((a, b) => b.deploymentId.localeCompare(a.deploymentId));

    // Prepare comparison data
    const comparisonData = prepareComparisonData(deployments);

    return {
      props: {
        deployments,
        comparisonData,
        csrfToken,
        sentryConfig,
      },
    };
  } catch (error) {
    console.error("[Admin Metrics] Error fetching metrics:", error);
    return {
      props: {
        deployments: [],
        comparisonData: [],
        csrfToken,
        sentryConfig,
      },
    };
  }
};
