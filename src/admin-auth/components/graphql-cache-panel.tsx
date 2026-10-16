import { Box, Typography } from "@mui/material";

import { useFetch } from "src/data/use-fetch";
import type { GraphqlCacheInfo } from "src/lib/graphql-cache";

const fetchGraphqlCache = async (): Promise<GraphqlCacheInfo> => {
  const res = await fetch("/api/admin/graphql-cache");
  if (!res.ok) {
    throw new Error(`Could not load GraphQL cache info (${res.status})`);
  }
  return res.json();
};

/**
 * Which backend serves the GraphQL response cache. Loaded from the API route
 * since that is where the GraphQL server and its cache live.
 */
export default function GraphqlCachePanel() {
  const info = useFetch({
    key: "admin-graphql-cache",
    queryFn: fetchGraphqlCache,
  });

  return (
    <Box mb={5} maxWidth={720}>
      <Typography variant="h5" component="h2" gutterBottom>
        GraphQL response cache
      </Typography>
      {info.state === "fetching" && (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      )}
      {info.state === "error" && (
        <Typography variant="body2" color="error">
          {info.error instanceof Error
            ? info.error.message
            : "Could not load GraphQL cache info"}
        </Typography>
      )}
      {info.data?.backend === "memory" && (
        <Typography variant="body1" color="text.secondary">
          <strong>In-memory</strong>, per server instance (REDIS_URL not set).
          Entries: {info.data.keys}
        </Typography>
      )}
      {info.data?.backend === "redis" && (
        <Box>
          <Typography variant="body1" color="text.secondary">
            <strong>Redis</strong> at {info.data.host}, shared by all instances.
            Status: {info.data.status}
          </Typography>
          {info.data.error ? (
            <Typography variant="body2" color="error" mt={0.5}>
              {info.data.error}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Keys: {info.data.keys} · Memory: {info.data.usedMemory} /{" "}
              {info.data.maxMemory}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
