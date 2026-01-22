import {
  Box,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import Head from "next/head";
import React, { ReactNode } from "react";

import LogoutButton from "./logout-button";

export interface AdminLayoutProps {
  title: string;
  csrfToken: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  header?: ReactNode;
  message?: string;
  error?: string;
  children: ReactNode;
}

export default function AdminLayout({
  title,
  csrfToken,
  breadcrumbs,
  header,
  message,
  error,
  children,
}: AdminLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
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
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 3 }}>
              {breadcrumbs.map((crumb, index) => {
                if (crumb.href) {
                  return (
                    <Link key={index} href={crumb.href} underline="hover">
                      {crumb.label}
                    </Link>
                  );
                }
                return (
                  <Typography key={index} color="text.primary">
                    {crumb.label}
                  </Typography>
                );
              })}
            </Breadcrumbs>
          )}

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
            {header ? (
              header
            ) : (
              <Typography variant="h4" component="h1">
                {title}
              </Typography>
            )}
            <LogoutButton csrfToken={csrfToken} />
          </Box>

          {/* Messages */}
          {message && (
            <Alert sx={{ mb: 2 }} severity="success">
              {message}
            </Alert>
          )}
          {error && (
            <Alert sx={{ mb: 2 }} severity="error">
              {error}
            </Alert>
          )}

          {/* Content */}
          {children}
        </Paper>
      </Box>
    </>
  );
}
