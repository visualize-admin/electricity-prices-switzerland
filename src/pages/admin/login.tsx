import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";

interface Props {
  csrfToken: string;
  returnTo: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  // Check if user is already authenticated
  const session = await parseSessionFromRequest(context.req);
  if (session) {
    // User already logged in, redirect to session config or return_to URL
    const returnTo =
      (Array.isArray(context.query.return_to)
        ? context.query.return_to[0]
        : context.query.return_to) || "/admin/session-config";
    return {
      redirect: {
        destination: returnTo,
        permanent: false,
      },
    };
  }

  // Generate CSRF token
  const csrfToken = generateCSRFToken();
  const returnTo =
    (Array.isArray(context.query.return_to)
      ? context.query.return_to[0]
      : context.query.return_to) || "/admin/session-config";

  return {
    props: {
      csrfToken,
      returnTo,
    },
  };
};

export default function AdminLoginPage({ csrfToken, returnTo }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          csrfToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect on success
      router.push(data.redirectTo || returnTo);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - ElCom Electricity Prices</title>
      </Head>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="background.default"
        padding={2}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 400,
            width: "100%",
            padding: 5,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Login
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Please enter the admin password to access the admin dashboard.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} mt={2}>
            <TextField
              type="password"
              id="password"
              name="password"
              label="Password"
              placeholder="Enter password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
