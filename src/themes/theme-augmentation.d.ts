import { Color } from "@mui/material";

declare module "@mui/material/styles" {
  interface PaletteColorOptions {
    hover: Color;
    active: Color;
    disabled: Color;
    light: Color;
  }
  interface Palette {
    brand: PaletteColor;
    diverging: string[];
    categorical: string[];
  }

  interface ButtonPropsVariantOverrides {
    primary: Color;
    secondary: Color;
    success: Color;
    error: Color;
    warning: Color;
    info: Color;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    reset: true;
    primary: true;
    secondary: true;
    success: true;
    outline: true;
    inverted: true;
    inline: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    meta: true;
    lead: true;
    table: true;
    giga: true;
    inline: true;
  }
}
