import { Box, Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import React from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import GraphqlCachePanel from "src/admin-auth/components/graphql-cache-panel";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { useFetch } from "src/data/use-fetch";
import type { listProcessCaches } from "src/lib/process-caches";
import type { CacheBackend } from "src/lib/shared-cache";

const backendLabels: Record<CacheBackend, string> = {
  redis: "Redis, all instances",
  memory: "memory, this instance",
};

const fetchCaches = async (): Promise<
  Awaited<ReturnType<typeof listProcessCaches>>
> => {
  const res = await fetch("/api/admin/caches");
  if (!res.ok) {
    throw new Error(`Could not load caches (${res.status})`);
  }
  return res.json();
};

const CacheRow = ({
  csrfToken,
  id,
  details,
}: {
  csrfToken: string;
  id: string;
  details: string;
}) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="flex-start"
    gap={2}
    pb={2}
    borderBottom={1}
    borderColor="divider"
  >
    <div>
      <Typography variant="subtitle1" fontWeight={600}>
        {id}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {details}
      </Typography>
    </div>
    <Box component="form" action="/api/admin/caches" method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outlined">
        Clear
      </Button>
    </Box>
  </Box>
);

interface Props {
  csrfToken: string;
  message?: string;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await parseSessionFromRequest(context.req);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login?return_to=/admin/caches",
        permanent: false,
      },
    };
  }

  return {
    props: {
      csrfToken: generateCSRFToken(session.sessionId),
      message: (context.query.message as string) || "",
      error: (context.query.error as string) || "",
    },
  };
};

export default function AdminCachesPage({ csrfToken, message, error }: Props) {
  // Loaded from the API route, whose caches are the ones serving data
  const caches = useFetch({ key: "admin-caches", queryFn: fetchCaches });

  return (
    <AdminLayout
      title="Caches"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "Caches" }]}
      message={message}
      error={error}
    >
      <GraphqlCachePanel />

      <Typography variant="h5" component="h2" gutterBottom>
        Process caches
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Caches in Redis (when REDIS_URL is set) are shared: clearing them
        applies to all instances. The others live in this server instance&apos;s
        memory, and clearing does not affect other instances. TTL still expires
        entries on its own; use this after bad SPARQL data or to force a CSV
        rebuild without a restart.
      </Typography>

      <Box display="flex" flexDirection="column" gap={3} maxWidth={720}>
        {caches.state === "fetching" && (
          <Typography variant="body2" color="text.secondary">
            Loading caches…
          </Typography>
        )}
        {caches.state === "error" && (
          <Typography variant="body2" color="error">
            {caches.error instanceof Error
              ? caches.error.message
              : "Could not load caches"}
          </Typography>
        )}
        {caches.data?.sharedCaches.map((cache) => (
          <CacheRow
            key={cache.namespace}
            csrfToken={csrfToken}
            id={cache.namespace}
            details={`Entries: ${cache.size} · ${backendLabels[cache.backend]}`}
          />
        ))}
        {caches.data && (
          <CacheRow
            csrfToken={csrfToken}
            id="search-index"
            details={`Entries: ${caches.data.searchIndexSize} · memory, this instance · 15m stale-while-revalidate`}
          />
        )}

        <Box component="form" action="/api/admin/caches" method="POST" pt={1}>
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="id" value="all" />
          <Button type="submit" variant="contained" color="primary">
            Clear all
          </Button>
        </Box>
      </Box>
    </AdminLayout>
  );
}
