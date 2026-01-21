import { Box, Paper, Alert, Link, Typography, Button } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import FlagInput from "src/admin-auth/components/FlagInput";
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
    // Not authenticated - redirect to login
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
    <>
      <Head>
        <title>Session Config - Flags</title>
      </Head>
      <Box minHeight="100vh" bgcolor="background.default" padding={2}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 800,
            margin: "20px auto",
            padding: 5,
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            pb={3}
            borderBottom={2}
            borderColor="divider"
          >
            <Typography variant="h4" component="h1">
              Session Config Flags Management
            </Typography>
            <Box
              component="form"
              action="/api/admin/session-config"
              method="POST"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="logout" value="true" />
              <Button type="submit" variant="outlined" color="secondary">
                Logout
              </Button>
            </Box>
          </Box>

          {/* Messages */}
          {message && (
            <Alert sx={{ mb: 2 }} severity="success">
              {message}
              <Link href="/" sx={{ ml: 1 }}>
                Go to home page
              </Link>
            </Alert>
          )}
          {error && (
            <Alert sx={{ mb: 2 }} severity="error">
              {error}
            </Alert>
          )}

          {/* Flags Form */}
          <Box
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
                Modify the session config flags below to change application
                behavior (only for you). Changes take effect immediately.
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

            <Box
              display="flex"
              gap={2}
              pt={3}
              borderTop={1}
              borderColor="divider"
            >
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
        </Paper>
      </Box>
    </>
  );
}
