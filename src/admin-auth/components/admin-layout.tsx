import {
  Alert,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";

import LogoutButton from "src/admin-auth/components/logout-button";

interface ActiveLinkProps {
  href: string;
  children: ReactNode;
}

function ActiveLink({ href, children }: ActiveLinkProps) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      component={NextLink}
      href={href}
      underline="hover"
      color={isActive ? "primary" : "inherit"}
      fontWeight={isActive ? 600 : 400}
      variant="body1"
    >
      {children}
    </Link>
  );
}

interface AdminLayoutProps {
  title: string;
  csrfToken: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  message?: string;
  error?: string;
  children: ReactNode;
}

export default function AdminLayout({
  title,
  csrfToken,
  breadcrumbs,
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
          elevation={0}
          sx={{
            padding: 5,
          }}
        >
          <Box display="flex" width="100%">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumbs sx={{ mb: 3 }}>
                {breadcrumbs.map((crumb, index) => {
                  if (crumb.href) {
                    return (
                      <Link
                        key={index}
                        href={crumb.href}
                        underline="hover"
                        variant="body2"
                      >
                        {crumb.label}
                      </Link>
                    );
                  }
                  return (
                    <Typography
                      key={index}
                      color="text.primary"
                      variant="body2"
                    >
                      {crumb.label}
                    </Typography>
                  );
                })}
              </Breadcrumbs>
            )}
            <Box ml="auto">
              <LogoutButton csrfToken={csrfToken} />
            </Box>
          </Box>
          {/* Navigation */}
          <Box
            display="flex"
            gap={8}
            mb={3}
            pb={2}
            borderBottom={1}
            borderColor="divider"
          >
            <ActiveLink href="/admin/session-config">Session Config</ActiveLink>
            <ActiveLink href="/admin/metrics">Metrics</ActiveLink>
            <ActiveLink href="/admin/api-status">API Status</ActiveLink>
            <ActiveLink href="/admin/document-download">
              Document Download
            </ActiveLink>
            <ActiveLink href="/admin/municipality-status">
              Municipality Status
            </ActiveLink>
          </Box>
          {/* Header */}

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
          <Box mt={8}>
            {/* Content */}
            {children}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
