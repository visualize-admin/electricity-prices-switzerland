import { CssBaseline, Box, Paper, Alert, Link } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";

import { SessionConfigFlags } from "src/session-config/flags";
import { theme } from "src/themes/elcom";

import FlagsList from "./FlagsList";
import Header from "./Header";

interface DashboardProps {
  flags: SessionConfigFlags;
  csrfToken: string;
  message?: string;
  messageLink?: {
    href: string;
    text: string;
  };
  error?: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  flags,
  csrfToken,
  message,
  messageLink,
  error,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Session Config - Flags</title>
    </head>
    <body>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
            padding: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 800,
              margin: "20px auto",
              padding: 5,
            }}
          >
            <Header csrfToken={csrfToken} />

            {message && (
              <Alert sx={{ mb: 2 }} severity="success">
                {message}
                {messageLink ? (
                  <Link href={messageLink.href} sx={{ ml: 1 }}>
                    {messageLink.text}
                  </Link>
                ) : null}
              </Alert>
            )}
            {error && (
              <Alert sx={{ mb: 2 }} severity="error">
                {error}
              </Alert>
            )}

            <FlagsList flags={flags} csrfToken={csrfToken} />
          </Paper>
        </Box>
      </ThemeProvider>
    </body>
  </html>
);

export default Dashboard;
