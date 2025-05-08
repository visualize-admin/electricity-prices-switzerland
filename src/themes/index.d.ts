import {
  FederalBreakpointOverrides,
  FederalColor,
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

declare module "@mui/material/IconButton" {
  interface IconButtonOwnProps {
    variant?: "contained" | "outlined" | "text";
  }
  interface IconButtonPropsColorOverrides {
    tertiary: true;
    error: false;
    success: false;
    default: false;
    info: false;
    warning: false;
  }

  interface IconButtonPropsSizeOverrides {
    small: false;
    medium: false;
    large: false;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsSizeOverrides {
    small: false;
    medium: false;
    large: false;

    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/Link" {
  interface LinkOwnProps {
    size?: "sm" | "md" | "lg" | "xl";
  }
  interface LinkPropsColorOverrides {
    primary: true;
    tertiary: true;
    error: false;
    success: false;
    info: false;
    warning: false;
    textPrimary: false;
    textSecondary: false;
    textDisabled: false;
  }
}
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    error: false;
    success: false;
    info: false;
    warning: false;
  }
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

  interface Palette {
    tertiary: { main: string; light: string; dark: string };
    monochrome: FederalColor & { main: string };
  }

  interface PaletteOptions {
    tertiary: { main: string; light: string; dark: string };
    monochrome: FederalColor & { main: string };
  }
}

export { theme } from "./elcom";
export { useTheme };
