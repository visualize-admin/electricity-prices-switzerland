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
  Autocomplete,
  TextField,
} from "@mui/material";
import { schemeCategory10 } from "d3";
import { utcFormat } from "d3-time-format";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import serverEnv from "src/env/server";
import GraphQLCacheChart, {
  MetricsChartPalette,
} from "src/metrics/cache-chart";
import GraphQLDurationsChart from "src/metrics/durations-chart";
import {
  listReleases,
  getOperationMetricsByRelease,
  OperationMetrics,
} from "src/metrics/metrics-store";
import { getSentryClient } from "src/metrics/sentry-client";
import {
  AggregatedOperationMetrics,
  ComparisonData,
  ReleaseMetrics,
} from "src/metrics/types";

interface SentryConfig {
  enabled: boolean;
  sampleRate: number;
  authTokenConfigured: boolean;
  release: string;
}
interface MetricsPageProps {
  releases: ReleaseMetrics[];
  comparisonData: ComparisonData[];
  csrfToken: string;
  sentryConfig: SentryConfig;
  availableReleases: string[];
  selectedReleases: string[];
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
      totalDurationMs,
      errorCount,
      errorRate: requestCount > 0 ? errorCount / requestCount : 0,
      cacheHitRate: totalCacheRequests > 0 ? cacheHit / totalCacheRequests : 0,
      responseCacheHit: cacheHit,
      responseCacheMiss: cacheMiss,
    };
  }

  return aggregated;
}

function prepareComparisonData(releases: ReleaseMetrics[]): ComparisonData[] {
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
            totalDurationMs: 0,
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
            totalDurationMs: metrics.totalDurationMs || 0,
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

const ReleaseSelector: React.FC<{
  availableReleases: string[];
  selectedReleases: string[];
  onSelectionChange: (releases: string[]) => void;
}> = ({ availableReleases, selectedReleases, onSelectionChange }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
    <Typography variant="h6" gutterBottom>
      Select Releases to Compare
    </Typography>
    <Autocomplete
      multiple
      options={availableReleases}
      value={selectedReleases}
      onChange={(_, newValue) => onSelectionChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} placeholder="Select releases to compare" />
      )}
      sx={{ minWidth: 300 }}
    />
  </Paper>
);

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
      <Box>
        <Typography variant="caption" color="text.secondary">
          Current release:
        </Typography>
        <Typography variant="body2" fontFamily="monospace">
          {sentryConfig.release}
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
  availableReleases,
  selectedReleases,
}: MetricsPageProps) {
  const router = useRouter();
  const [localSelectedReleases, setLocalSelectedReleases] =
    useState<string[]>(selectedReleases);

  const handleReleaseSelectionChange = (newReleases: string[]) => {
    setLocalSelectedReleases(newReleases);

    // Update URL with new selection
    const query = { ...router.query };
    if (newReleases.length > 0) {
      query.releases = newReleases.join(",");
    } else {
      delete query.releases;
    }

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: false }
    );
  };

  const palette: MetricsChartPalette = {
    background: "#fefefe",

    // pastel green and red
    cacheHit: "#34d399",
    cacheMiss: "#f87171",
  };

  if (releases.length === 0) {
    return (
      <AdminLayout
        title="GraphQL Metrics Dashboard"
        csrfToken={csrfToken}
        breadcrumbs={[{ label: "Admin" }, { label: "Metrics" }]}
      >
        <ReleaseSelector
          availableReleases={availableReleases}
          selectedReleases={localSelectedReleases}
          onSelectionChange={handleReleaseSelectionChange}
        />
        <SentryConfigurationCard sentryConfig={sentryConfig} />
        <Typography color="text.secondary">
          {localSelectedReleases.length === 0
            ? "Please select releases to compare."
            : "No metrics found for selected releases."}
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

      {/* Release Selector */}
      <ReleaseSelector
        availableReleases={availableReleases}
        selectedReleases={localSelectedReleases}
        onSelectionChange={handleReleaseSelectionChange}
      />

      {/* Releases Metadata */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          Releases ({releases.length})
        </Typography>
        {releases.map((release) => (
          <Box key={release.release} sx={{ display: "flex", gap: 4, mb: 1 }}>
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
                {utcFormat("%Y-%m-%d %H:%M:%S")(new Date(release.collectedAt))}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Sentry Configuration */}
      <SentryConfigurationCard sentryConfig={sentryConfig} />

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Chip
          clickable={false}
          label="Cache Hit"
          sx={{ bgcolor: palette.cacheHit, color: "white" }}
        />
        <Chip
          clickable={false}
          label="Cache Miss"
          sx={{ bgcolor: palette.cacheMiss, color: "white" }}
        />
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

      {/* Cache Performance Chart */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Cache Performance by Operation
      </Typography>
      <GraphQLCacheChart
        comparisonData={comparisonData}
        releases={releases}
        palette={palette}
      />

      {/* Duration Chart Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 6 }}>
        Total Duration by Operation
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Sum of all request durations for each operation across selected releases
      </Typography>
      <GraphQLDurationsChart
        comparisonData={comparisonData}
        releases={releases}
      />

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
                  <TableCell key={`${release.release}-misses`} align="right">
                    Misses
                  </TableCell>
                  <TableCell key={`${release.release}-rate`} align="right">
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
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps<MetricsPageProps> = async (
  context
) => {
  // Get session for CSRF token (auth is handled by middleware)
  const session = await parseSessionFromRequest(context.req);
  const csrfToken = session ? generateCSRFToken(session.sessionId) : "";

  // Get Sentry configuration and current release
  const sentryClient = getSentryClient();
  const currentRelease = sentryClient.getCurrentRelease();
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
    release: currentRelease,
  };

  // Fetch all available releases
  const availableReleases = (await listReleases()).slice(0, 20); // Get more releases for selection

  // Parse selected releases from query parameter
  const selectedReleasesParam = context.query.releases as string;
  let selectedReleases = selectedReleasesParam
    ? selectedReleasesParam
        .split(",")
        .filter((r) => availableReleases.includes(r))
    : [];

  // Always ensure current release is included if it exists in available releases
  if (
    availableReleases.includes(currentRelease) &&
    !selectedReleases.includes(currentRelease) &&
    selectedReleases.length === 0
  ) {
    selectedReleases = [currentRelease, ...selectedReleases];
  }

  // If no releases selected and current release is available, default to current + first 4 others
  if (selectedReleases.length === 0) {
    const otherReleases = availableReleases
      .filter((r) => r !== currentRelease)
      .slice(0, 4);
    selectedReleases = availableReleases.includes(currentRelease)
      ? [currentRelease, ...otherReleases]
      : [];
  }

  // Fetch metrics only for selected releases
  const releases: ReleaseMetrics[] = await Promise.all(
    selectedReleases.map(async (release) => {
      const rawMetrics = await getOperationMetricsByRelease(release);
      const operations = aggregateMetrics(rawMetrics);

      return {
        release,
        collectedAt: new Date().toISOString(),
        operations,
      };
    })
  );

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
      availableReleases,
      selectedReleases,
    },
  };
};
