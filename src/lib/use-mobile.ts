import { useMediaQuery, useTheme } from "@mui/material";

export const useIsMobile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return isMobile;
};
