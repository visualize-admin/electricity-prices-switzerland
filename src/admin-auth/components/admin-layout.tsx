import {
  Box,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";

import LogoutButton from "./logout-button";

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
          elevation={0}
          sx={{
            padding: 5,
          }}
        >
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
                  <Typography key={index} color="text.primary" variant="body2">
                    {crumb.label}
                  </Typography>
                );
              })}
            </Breadcrumbs>
          )}
          {/* Navigation */}
          <Box
            display="flex"
            gap={3}
            mb={3}
            pb={2}
            borderBottom={1}
            borderColor="divider"
          >
            <ActiveLink href="/admin/session-config">Session Config</ActiveLink>
            <ActiveLink href="/admin/metrics">Metrics</ActiveLink>
          </Box>
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
