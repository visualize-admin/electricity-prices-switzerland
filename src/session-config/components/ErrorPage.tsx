import {
  CssBaseline,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";

import { theme } from "src/themes/elcom";

interface ErrorPageProps {
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Admin Error</title>
    </head>
    <body>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            padding: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 500,
              width: "100%",
              padding: 5,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Error
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {message}
            </Alert>

            <Button variant="contained" color="primary" href="/api/admin">
              Back to Admin
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    </body>
  </html>
);

export default ErrorPage;
