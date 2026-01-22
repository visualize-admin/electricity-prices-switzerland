import { Box, Button } from "@mui/material";
import React from "react";

interface LogoutButtonProps {
  csrfToken: string;
}

export default function LogoutButton({ csrfToken }: LogoutButtonProps) {
  return (
    <Box component="form" action="/api/admin/logout" method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <Button type="submit" variant="outlined" color="secondary">
        Logout
      </Button>
    </Box>
  );
}
