/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `theme` should be a plain object, conforming to the `Theme` type.
 */
import { Breakpoint, createTheme } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";
import { omit } from "lodash";

const grey = {
  100: "#FFFFFF",
  200: "#F5F5F5",
  300: "#E5E5E5",
  400: "#D5D5D5",
  500: "#CCCCCC",
  600: "#757575",
  700: "#454545",
  800: "#333333",
  900: "#000000",
} as const;

const breakpoints = ["xs", "md", "md"] as Breakpoint[];

const fontSizes = [
  "0rem",
  "0.625rem",
  "0.75rem",
  "0.875rem",
  "1rem",
  "1.125rem",
  "1.5rem",
  "2rem",
  "2.5rem",
  "3rem",
  "4.5rem",
  "5.5rem",
];

const fontWeights: Record<string, number> = {
  light: 300,
  regular: 400,
  heading: 700,
  bold: 700,
};
// FIXME: should it be relative values? 1.5, etc.
const lineHeights = [
  "0rem",
  "1rem",
  "1.125rem",
  "1.25rem",
  "1.375rem",
  "1.5rem",
  "1.750rem",
  "2.250rem",
  "3rem",
  "4rem",
  "4.5rem",
];

const createTypographyVariant = (theme: Theme, spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  res.fontWeight = fontWeights[spec.fontWeight];
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${lineHeights[spec.lineHeight[i]]}`;
    const fontSize = `${fontSizes[spec.fontSize[i]]}`;
    res[theme.breakpoints.up(breakpoints[i])] = {
      fontSize,
      lineHeight,
    };
  }
  return res;
};

const bpTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 992,
      lg: 1200,
      xl: 1920,
    },
  },
});

export const theme: Theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 992,
      lg: 1200,
      xl: 1920,
    },
  },
  spacing: [
    "0",
    "0.25rem",
    "0.5rem",
    "0.75rem",
    "1rem",
    "1.5rem",
    "2rem",
    "4rem",
    "4.5rem",
  ],
  palette: {
    text: {
      primary: grey[900],
    },
    background: {
      paper: grey[100],
    },

    brand: {
      main: "#DC0018",
    },

    primary: {
      main: "#006699",
      hover: "#004B70",
      active: "#00334D",
      disabled: "#599cbd",
      light: "#d8e8ef",
    },

    secondary: {
      main: "#757575",
      hover: "#616161",
      active: "#454545",
      disabled: "#a6a6a6",
    },

    success: {
      main: "#3c763d",
      hover: "#3c763d",
      active: "#3c763d",
      disabled: "#DFF0D8",
      light: "#DFF0D8",
    },

    muted: {
      main: "#F5F5F5",
      colored: "#F9FAFB",
      darker: "#F2F7F9",
      transparent: "rgba(245,245,245,0.8)",
    },
    focus: {
      main: "#333333",
    },
    error: {
      main: "#FF5555",
    },
    hint: {
      main: "#757575",
    },
    missing: {
      main: "#EFEFEF",
    },

    alert: {
      main: "#DC0018",
      light: "#ffe6e1",
    },
    diverging: ["#51b581", "#a8dc90", "#e7ec83", "#f1b865", "#eb7c40"],
    categorical: ["#64afe9", "#01ADA1", "#939CB4", "#91C34B", "#E89F00"],
  },

  shape: {
    borderRadius: 3,
  },

  typography: {
    fontFamily:
      "FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
    // monospace: "Menlo, monospace"

    giga: createTypographyVariant(bpTheme, {
      lineHeight: 1.2,
      fontWeight: "bold",
      fontSize: [8, 9, 9],
    }),
    h1: createTypographyVariant(bpTheme, {
      lineHeight: [8, 8, 8],
      fontWeight: "bold",
      fontSize: [7, 7, 7],
    }),
    h2: createTypographyVariant(bpTheme, {
      lineHeight: [6, 7, 7],
      fontWeight: "regular",
      fontSize: [5, 6, 6],
    }),
    h3: createTypographyVariant(bpTheme, {
      lineHeight: [5, 6, 6],
      fontWeight: "bold",
      fontSize: [4, 5, 5],
    }),
    lead: createTypographyVariant(bpTheme, {
      lineHeight: [4, 5, 5],
      fontWeight: "bold",
      fontSize: [3, 4, 4],
    }),
    body1: createTypographyVariant(bpTheme, {
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4],
    }),
    body2: createTypographyVariant(bpTheme, {
      lineHeight: [2, 4, 3],
      fontWeight: "regular",
      fontSize: [2, 3, 3],
    }),
    table: createTypographyVariant(bpTheme, {
      lineHeight: [2, 4, 4],
      fontWeight: "regular",
      fontSize: [2, 3, 3],
    }),
    meta: createTypographyVariant(bpTheme, {
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
    }),
  },
  shadows: {
    primary: "0 3px 5px 0 rgba(0,0,0,0.10)",
    rightSide: "2px 0 4px 0 rgba(0,0,0,0.05)",
    leftSide: "-2px 0 2px 0 rgba(0,0,0,0.05)",
    tooltip: "0 2px 8px rgba(0, 0, 0, 0.25)",
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'FrutigerNeue';
          font-display: swap;
          font-weight: 700;
          src: url(/fonts/FrutigerNeueW02-Bd.woff2) format('woff2');
        }

        @font-face {
          font-family: 'FrutigerNeue';
          font-display: swap;
          font-weight: 500;
          src:  url(/fonts/FrutigerNeueW02-Regular.woff2) format('woff2');
        }

        @font-face {
          font-family: 'FrutigerNeue';
          font-display: swap;
          font-weight: 700;
          src: url(/fonts/FrutigerNeueW02-Bd.woff2) format('woff2');
        }

      `,
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "reset" },
          style: {
            background: "transparent",
            border: "none",
          },
        },
        {
          props: { variant: "primary" },
          style: {
            background: "primary",
            color: grey[100],
            borderRadius: "default",
            width: "100%",
            px: 4,
            py: 3,
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            "&:hover": {
              background: "primary.hover",
            },
            "&:active": {
              background: "primary.active",
            },
            "&:disabled": {
              cursor: "initial",
              background: "primary.disabledd",
            },
          },
        },
        {
          props: { variant: "secondary" },
          style: {
            background: "secondary",
            color: grey[100],
            borderRadius: "default",
            width: "100%",
            px: 4,
            py: 3,
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            "&:hover": {
              background: "secondaryHover",
            },
            "&:active": {
              background: "secondaryActive",
            },
            "&:disabled": {
              cursor: "initial",
              background: "secondaryDisabled",
            },
          },
        },
        {
          props: { variant: "success" },
          style: {
            background: "success",
            color: grey[100],
            borderRadius: "default",
            width: "100%",
            px: 4,
            py: 3,
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            "&:hover": {
              background: "success.hover",
            },
            "&:active": {
              background: "success.active",
            },
            "&:disabled": {
              cursor: "initial",
              background: "success.disabled",
            },
          },
        },
        {
          props: { variant: "outline" },
          style: {
            background: grey[100],
            color: "primary.main",
            borderRadius: "default",
            width: "100%",
            px: 4,
            py: 3,
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            "&:hover": {
              background: "muted.main",
            },
            "&:active": {
              background: "muted.main",
            },
            "&:disabled": {
              cursor: "initial",
              background: "muted",
            },
          },
        },
        {
          props: { variant: "inverted" },
          style: {
            background: grey[100],
            color: grey[800],
            borderRadius: "default",
            width: ["100%", "auto"],
            px: 4,
            py: 3,
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            "&:hover": {
              background: grey[300],
            },
            "&:active": {
              background: grey[400],
            },
            "&:disabled": {
              cursor: "initial",
              color: grey[600],
              background: grey[300],
            },
          },
        },
        {
          props: { variant: "inline" },
          style: {
            background: "transparent",
            color: "primary.main",
            lineHeight: [1, 2, 2],
            fontWeight: "regular",
            fontSize: [3, 3, 3],
            border: "none",
            cursor: "pointer",
            p: 0,
            "&:hover": {
              color: "primary.hover",
            },
            "&:disabled": {
              cursor: "initial",
              color: grey[500],
            },
          },
        },
      ],
    },
  },
});

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const fonts = [
  {
    src: "/fonts/FrutigerNeueW02-Bd.woff2",
    format: "woff2",
    weight: "700",
  },
  {
    src: "/fonts/FrutigerNeueW02-Regular.woff2",
    format: "woff2",
    weight: "400",
  },
  {
    src: "/fonts/FrutigerNeueW02-Light.woff2",
    format: "woff2",
    weight: "300",
  },
];
