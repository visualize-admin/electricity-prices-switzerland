import {
  CssBaseline,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  InputBase,
  InputLabel,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";

import { theme } from "src/themes/elcom";

interface LoginFormProps {
  csrfToken: string;
  errorMessage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ csrfToken, errorMessage }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Admin Login - ElCom Electricity Prices</title>
    </head>
    <body>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
              Session Config Login
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please enter the session config password to access the session
              config flags management.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" method="POST" mt={2}>
              <InputLabel htmlFor="password" sx={{ mb: 1, display: "block" }}>
                Password
              </InputLabel>
              <InputBase
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                required
                fullWidth
                sx={{ mb: 3 }}
              />

              <input type="hidden" name="csrfToken" value={csrfToken} />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </ThemeProvider>
    </body>
  </html>
);

export default LoginForm;
