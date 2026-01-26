import { Box, Typography, Button } from "@mui/material";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import FlagInput from "src/admin-auth/components/flag-input";
import { generateCSRFToken } from "src/admin-auth/crsf";
import {
  getDefaultedFlags,
  getFlagInfo,
  SessionConfigFlags,
} from "src/admin-auth/flags";
import { parseSessionFromRequest } from "src/admin-auth/session";

interface Props {
  flags: SessionConfigFlags;
  csrfToken: string;
  message?: string;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  // Get session
  const session = await parseSessionFromRequest(context.req);

  if (!session) {
    // Not authenticated - redirect to login, should not happen due to admin middleware
    return {
      redirect: {
        destination: "/admin/login?return_to=/admin/session-config",
        permanent: false,
      },
    };
  }

  // Generate CSRF token
  const csrfToken = generateCSRFToken(session.sessionId);

  return {
    props: {
      flags: getDefaultedFlags(session.flags),
      csrfToken,
      message: (context.query.message as string) || "",
      error: (context.query.error as string) || "",
    },
  };
};

export default function AdminSessionConfigPage({
  flags,
  csrfToken,
  message,
  error,
}: Props) {
  const router = useRouter();

  return (
    <AdminLayout
      title="Session Config - Flags"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "Session Config" }]}
      header={
        <Typography variant="h4" component="h1">
          Session Config Flags Management
        </Typography>
      }
      message={message}
      error={error}
    >
      <Box
        sx={{ maxWidth: "800px", margin: "0 auto" }}
        component="form"
        action="/api/admin/session-config"
        method="POST"
      >
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <Box mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Configuration Flags
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Modify the session config flags below to change application behavior
            (only for you). Changes take effect immediately.
          </Typography>

          {Object.entries(flags).map(([key, value]) => {
            const { description, type } = getFlagInfo(
              key as keyof typeof flags
            );
            return (
              <FlagInput
                key={key}
                flagKey={key}
                value={value}
                type={type}
                description={description}
              />
            );
          })}
        </Box>

        <Box display="flex" gap={2} pt={3} borderTop={1} borderColor="divider">
          <Button type="submit" variant="contained" color="primary">
            Update Flags
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={() => router.reload()}
          >
            Reset Form
          </Button>
        </Box>
      </Box>
    </AdminLayout>
  );
}
