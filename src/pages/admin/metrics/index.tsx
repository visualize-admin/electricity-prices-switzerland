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
  listReleases,
  getOperationMetricsByRelease,
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

interface ReleaseMetrics {
  release: string;
  collectedAt: string;
  operations: Record<string, AggregatedOperationMetrics>;
}

interface ComparisonData {
  operation: string;
  releases: Array<{
    release: string;
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
  releases: ReleaseMetrics[];
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
  releases: ReleaseMetrics[]
): ComparisonData[] {
  // Collect all unique operation names
  const allOperations = new Set<string>();
  releases.forEach((release) => {
    Object.keys(release.operations).forEach((op) => allOperations.add(op));
  });

  // Build comparison data
  const comparisonData: ComparisonData[] = Array.from(allOperations).map(
    (operation) => {
      return {
        operation,
        releases: releases.map((release) => {
          const metrics = release.operations[operation] || {
            responseCacheHit: 0,
            responseCacheMiss: 0,
            cacheHitRate: 0,
          };
          const cacheHit = metrics.responseCacheHit;
          const cacheMiss = metrics.responseCacheMiss;
          const total = cacheHit + cacheMiss;

          return {
            release: release.release,
            cacheHit,
            cacheMiss,
            total,
            hitRate: metrics.cacheHitRate,
          };
        }),
      };
    }
  );

  // Filter out operations with zero total across all releases
  const filtered = comparisonData.filter((item) =>
    item.releases.some((d) => d.total > 0)
  );

  // Sort by total requests (descending)
  filtered.sort((a, b) => {
    const aTotal = a.releases.reduce((sum, d) => sum + d.total, 0);
    const bTotal = b.releases.reduce((sum, d) => sum + d.total, 0);
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
  releases,
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
        d3.max(comparisonData, (d) =>
          d3.max(d.releases, (rel) => rel.total)
        ) || 0;

      const x = d3.scaleLinear().domain([0, maxTotal]).range([0, width]);

      const y = d3
        .scaleBand()
        .domain(comparisonData.map((d) => d.operation))
        .range([0, height])
        .padding(0.3);

      // Color scale for releases
      const releaseColor = d3
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

      // For each operation, draw bars for each release
      comparisonData.forEach((opData, opIndex) => {
        const group = d3.select(groups.nodes()[opIndex]);

        opData.releases.forEach((relData, relIndex) => {
          const yOffset = relIndex * barHeight;
          const relGroup = group
            .append("g")
            .attr("transform", `translate(0, ${yOffset})`);

          // Cache hit (green)
          relGroup
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", x(relData.cacheHit))
            .attr("height", barHeight - 2)
            .attr("fill", "#22c55e")
            .attr("opacity", 0.8)
            .on("mouseover", function (event) {
              tooltip
                .style("opacity", 1)
                .html(
                  `
                  <div class="tooltip-title">${relData.release}</div>
                  <div class="tooltip-row">
                    <span>Operation:</span>
                    <strong>${opData.operation}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Hit:</span>
                    <strong>${relData.cacheHit}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Miss:</span>
                    <strong>${relData.cacheMiss}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Hit Rate:</span>
                    <strong>${(relData.hitRate * 100).toFixed(1)}%</strong>
                  </div>
                `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

          // Cache miss (red)
          relGroup
            .append("rect")
            .attr("x", x(relData.cacheHit))
            .attr("y", 0)
            .attr("width", x(relData.cacheMiss))
            .attr("height", barHeight - 2)
            .attr("fill", "#ef4444")
            .attr("opacity", 0.8)
            .on("mouseover", function (event) {
              tooltip
                .style("opacity", 1)
                .html(
                  `
                  <div class="tooltip-title">${relData.release}</div>
                  <div class="tooltip-row">
                    <span>Operation:</span>
                    <strong>${opData.operation}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Hit:</span>
                    <strong>${relData.cacheHit}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Cache Miss:</span>
                    <strong>${relData.cacheMiss}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span>Hit Rate:</span>
                    <strong>${(relData.hitRate * 100).toFixed(1)}%</strong>
                  </div>
                `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

          // Release label on the right
          relGroup
            .append("text")
            .attr("x", width + 10)
            .attr("y", barHeight / 2)
            .attr("dy", "0.35em")
            .attr("font-size", "10px")
            .attr("fill", releaseColor(relData.release) as string)
            .text(relData.release);
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

  if (releases.length === 0) {
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
        Release Comparison - Cache Hit/Miss Analysis
      </Typography>

      {/* Releases Metadata */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          Releases ({releases.length})
        </Typography>
        {releases.map((release) => (
          <Box
            key={release.release}
            sx={{ display: "flex", gap: 4, mb: 1 }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Release:
              </Typography>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{ wordBreak: "break-all" }}
              >
                {release.release}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Collected:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {utcFormat("%Y-%m-%d %H:%M:%S")(
                  new Date(release.collectedAt)
                )}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Sentry Configuration */}
      <SentryConfigurationCard sentryConfig={sentryConfig} />

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Chip label="Cache Hit" sx={{ bgcolor: "#22c55e", color: "white" }} />
        <Chip label="Cache Miss" sx={{ bgcolor: "#ef4444", color: "white" }} />
        {releases.map((release, index) => (
          <Chip
            key={release.release}
            label={release.release}
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
              {releases.map((release) => (
                <TableCell
                  key={release.release}
                  colSpan={3}
                  align="center"
                  sx={{ borderLeft: "2px solid", borderLeftColor: "divider" }}
                >
                  {release.release}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell />
              {releases.map((release) => (
                <>
                  <TableCell
                    key={`${release.release}-hits`}
                    align="right"
                    sx={{ borderLeft: "2px solid", borderLeftColor: "divider" }}
                  >
                    Hits
                  </TableCell>
                  <TableCell
                    key={`${release.release}-misses`}
                    align="right"
                  >
                    Misses
                  </TableCell>
                  <TableCell
                    key={`${release.release}-rate`}
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
                {item.releases.map((rel) => (
                  <>
                    <TableCell
                      key={`${rel.release}-hits`}
                      align="right"
                      sx={{
                        fontFamily: "monospace",
                        borderLeft: "2px solid",
                        borderLeftColor: "divider",
                      }}
                    >
                      {rel.cacheHit}
                    </TableCell>
                    <TableCell
                      key={`${rel.release}-misses`}
                      align="right"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {rel.cacheMiss}
                    </TableCell>
                    <TableCell
                      key={`${rel.release}-rate`}
                      align="right"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {(rel.hitRate * 100).toFixed(1)}%
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
        ? process.env.VERCEL_URL
          ? 1.0
          : 0.1
        : 1.0),
    authTokenConfigured: sentryClient.isConfigured(),
  };

  try {
    // Fetch all releases
    const releaseIds = await listReleases();

    // Fetch metrics for each release
    const releases: ReleaseMetrics[] = [];
    for (const release of releaseIds) {
      const rawMetrics = await getOperationMetricsByRelease(release);
      const operations = aggregateMetrics(rawMetrics);

      releases.push({
        release,
        collectedAt: new Date().toISOString(),
        operations,
      });
    }

    // Sort releases by ID (most recent first)
    releases.sort((a, b) => b.release.localeCompare(a.release));

    // Prepare comparison data
    const comparisonData = prepareComparisonData(releases);

    return {
      props: {
        releases,
        comparisonData,
        csrfToken,
        sentryConfig,
      },
    };
  } catch (error) {
    console.error("[Admin Metrics] Error fetching metrics:", error);
    return {
      props: {
        releases: [],
        comparisonData: [],
        csrfToken,
        sentryConfig,
      },
    };
  }
};
