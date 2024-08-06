import { Box } from "@mui/material";
import { visuallyHidden } from "@mui/utils";

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <Box sx={visuallyHidden}>{children}</Box>
);

export default VisuallyHidden;
