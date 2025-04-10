import {
  FederalBreakpointOverrides,
  FederalTypographyPropsVariantOverrides,
  FederalTypographyVariants,
  FederalTypographyVariantsOptions,
} from "@interactivethings/swiss-federal-ci";
import { useTheme } from "@mui/material";

declare module "@mui/material" {
  interface TypographyVariants extends FederalTypographyVariants {}
  interface TypographyVariantsOptions
    extends FederalTypographyVariantsOptions {}
}

declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    small: false;
    medium: false;
    large: false;

    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/InputBase" {
  interface InputBasePropsSizeOverrides {
    small: false;
    medium: false;

    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides
    extends FederalTypographyPropsVariantOverrides {}
}

declare module "@mui/material/styles" {
  interface BreakpointOverrides extends FederalBreakpointOverrides {}
}

export { theme } from "./elcom";
export { useTheme };
