/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `theme` should be a plain object, conforming to the `Theme` type.
 */
import { createTheme } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";

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
  space: [
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

  fonts: {
    body: "FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
    monospace: "Menlo, monospace",
  },
  fontSizes: [
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
  ],
  fontWeights: {
    light: 300,
    regular: 400,
    heading: 700,
    bold: 700,
  },
  // FIXME: should it be relative values? 1.5, etc.
  lineHeights: [
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
  ],

  radii: {
    default: 3,
    bigger: 4,
    circle: 99999,
  },
  shadows: {
    primary: "0 3px 5px 0 rgba(0,0,0,0.10)",
    rightSide: "2px 0 4px 0 rgba(0,0,0,0.05)",
    leftSide: "-2px 0 2px 0 rgba(0,0,0,0.05)",
    tooltip: "0 2px 8px rgba(0, 0, 0, 0.25)",
  },
  text: {
    giga: {
      fontFamily: "body",
      lineHeight: 1.2,
      fontWeight: "bold",
      fontSize: [8, 9, 9],
    },
    heading1: {
      fontFamily: "body",
      lineHeight: [8, 8, 8],
      fontWeight: "bold",
      fontSize: [7, 7, 7],
    },
    heading2: {
      fontFamily: "body",
      lineHeight: [6, 7, 7],
      fontWeight: "regular",
      fontSize: [5, 6, 6],
    },
    heading3: {
      fontFamily: "body",
      lineHeight: [5, 6, 6],
      fontWeight: "bold",
      fontSize: [4, 5, 5],
    },
    lead: {
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "bold",
      fontSize: [3, 4, 4],
    },
    paragraph1: {
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4],
    },
    paragraph2: {
      fontFamily: "body",
      lineHeight: [2, 4, 3],
      fontWeight: "regular",
      fontSize: [2, 3, 3],
    },
    table: {
      fontFamily: "body",
      lineHeight: [2, 4, 4],
      fontWeight: "regular",
      fontSize: [2, 3, 3],
    },
    meta: {
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
    },
  },
  components: {
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
            fontFamily: "body",
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            ":hover": {
              background: "primaryHover",
            },
            ":active": {
              background: "primaryActive",
            },
            ":disabled": {
              cursor: "initial",
              background: "primaryDisabled",
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
            fontFamily: "body",
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            ":hover": {
              background: "secondaryHover",
            },
            ":active": {
              background: "secondaryActive",
            },
            ":disabled": {
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
            fontFamily: "body",
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            ":hover": {
              background: "successHover",
            },
            ":active": {
              background: "successActive",
            },
            ":disabled": {
              cursor: "initial",
              background: "successDisabled",
            },
          },
        },
        {
          props: { variant: "outline" },
          style: {
            background: grey[100],
            color: "primary",
            borderRadius: "default",
            width: "100%",
            px: 4,
            py: 3,
            fontFamily: "body",
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            ":hover": {
              background: "muted",
            },
            ":active": {
              background: "muted",
            },
            ":disabled": {
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
            fontFamily: "body",
            fontSize: 4,
            transition: "background-color .2s",
            cursor: "pointer",
            ":hover": {
              background: grey[300],
            },
            ":active": {
              background: grey[400],
            },
            ":disabled": {
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
            color: "primary",
            fontFamily: "body",
            lineHeight: [1, 2, 2],
            fontWeight: "regular",
            fontSize: [3, 3, 3],
            border: "none",
            cursor: "pointer",
            p: 0,
            ":hover": {
              color: "primaryHover",
            },
            ":disabled": {
              cursor: "initial",
              color: grey[500],
            },
          },
        },
      ],
    },
  },
  links: {
    inline: {
      cursor: "pointer",
      color: "primary",
      textDecoration: "none",
      "&:hover": {
        color: "primaryHover",
      },
      "&:active": {
        color: "primaryActive",
      },
      "&:visited": {
        color: "primary",
      },
    },
  },
});

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/fonts/FrutigerNeueW02-Bd.woff2",
  "/fonts/FrutigerNeueW02-Regular.woff2",
  "/fonts/FrutigerNeueW02-Light.woff2",
];
