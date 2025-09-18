import { Box, Typography, Button } from "@mui/material";
import React from "react";

interface HeaderProps {
  csrfToken: string;
}

const Header: React.FC<HeaderProps> = ({ csrfToken }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 4,
      pb: 3,
      borderBottom: 2,
      borderColor: "divider",
    }}
  >
    <Typography variant="h4" component="h1">
      Session Config Flags Management
    </Typography>
    <Box component="form" method="POST">
      <input type="hidden" name="logout" value="true" />
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <Button type="submit" variant="outlined" color="secondary">
        Logout
      </Button>
    </Box>
  </Box>
);

export default Header;
