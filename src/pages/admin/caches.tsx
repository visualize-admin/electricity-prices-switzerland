import { Box, Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import React from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { listProcessCaches, ProcessCacheInfo } from "src/lib/process-caches";

interface Props {
  csrfToken: string;
  caches: ProcessCacheInfo[];
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
      caches: listProcessCaches(),
      message: (context.query.message as string) || "",
      error: (context.query.error as string) || "",
    },
  };
};

export default function AdminCachesPage({
  csrfToken,
  caches,
  message,
  error,
}: Props) {
  return (
    <AdminLayout
      title="Caches"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "Caches" }]}
      message={message}
      error={error}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        In-process caches
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        These live in this server instance&apos;s memory. Clearing does not
        affect other instances (Vercel Fluid). TTL still expires entries on its
        own; use this after bad SPARQL data or to force a CSV rebuild without a
        restart.
      </Typography>

      <Box display="flex" flexDirection="column" gap={3} maxWidth={720}>
        {caches.map((cache) => (
          <Box
            key={cache.id}
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={2}
            pb={2}
            borderBottom={1}
            borderColor="divider"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {cache.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cache.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Entries: {cache.size}
              </Typography>
            </Box>
            <Box component="form" action="/api/admin/caches" method="POST">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="id" value={cache.id} />
              <Button type="submit" variant="outlined" size="small">
                Clear
              </Button>
            </Box>
          </Box>
        ))}

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
