import { Color } from "@mui/material";

declare module "@mui/material/styles/createPalette" {
  interface PaletteColorOptions {
    hover?: string;
    active?: string;
    disabled?: string;
    light?: string;
  }
}
declare module "@mui/material/styles" {
  interface PaletteOptions {
    brand: PaletteColor;
    diverging: string[];
    categorical: string[];
    muted: {
      main: string;
      darker: string;
      colored: string;
      transparent: string;
    };
    focus: {
      main: string;
    };

    hint: {
      main: string;
    };

    missing: {
      main: string;
    };

    alert: {
      main: string;
      light: string;
    };
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

  interface ThemeOptions {
    shadows: {
      primary: string;
      rightSide: string;
      leftSide: string;
      tooltip: string;
    };
  }

  interface Shadows {
    primary: string;
    rightSide: string;
    leftSide: string;
    tooltip: string;
  }

  interface Theme {
    shadows: Shadows;
  }

  interface TypographyVariantsOptions {
    giga: React.CSSProperties;
    lead: React.CSSProperties;
    table: React.CSSProperties;
    meta: React.CSSProperties;
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
