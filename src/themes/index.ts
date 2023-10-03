import { useTheme as useMuiTheme } from "@mui/material";

import { ElcomTheme } from "src/themes/elcom";

export const useTheme = () => useMuiTheme() as ElcomTheme;
