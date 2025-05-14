import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

const PreviewAuthenticationPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/preview-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid password");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
      display="flex"
    >
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Stack direction="column" spacing={2} sx={{ minWidth: 300 }}>
          <Typography variant="body2">Preview Password</Typography>
          <TextField
            id="preview-password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </form>
    </Box>
  );
};

export default PreviewAuthenticationPage;
