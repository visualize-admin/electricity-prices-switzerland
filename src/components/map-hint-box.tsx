import { Box } from "@mui/material";
import { ReactNode } from "react";

const HintBox = ({ children }: { children: ReactNode }) => (
  <Box
    display="flex"
    width="100%"
    height="100%"
    color="hint.main"
    margin="auto"
    textAlign="center"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    zIndex={1}
    position="relative"
  >
    <Box bgcolor="muted.transparent" borderRadius="bigger" p={2}>
      {children}
    </Box>
  </Box>
);

export default HintBox;
