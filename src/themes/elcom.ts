/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `theme` should be a plain object, conforming to the `Theme` type.
 */

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/fonts/FrutigerNeueW02-Bd.woff2",
  "/fonts/FrutigerNeueW02-Regular.woff2",
  "/fonts/FrutigerNeueW02-Light.woff2",
];
import { createTheme } from "@mui/material";
import merge from "lodash/merge";

import federalTheme, { createTypographyVariant } from "./federal";

declare module "@mui/material" {
  interface PaletteOptions {
    diverging?: string[];
    categorical?: string[];
  }

  interface Palette {
    diverging: string[];
    categorical: string[];
  }
  interface TypographyVariants {
    meta?: React.CSSProperties;
    lead?: React.CSSProperties;
    giga?: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    meta?: React.CSSProperties;
    lead?: React.CSSProperties;
    giga?: React.CSSProperties;
  }

  interface TypographyPropsVariantOverrides {
    meta?: true;
    lead?: true;
    giga?: true;
  }
}
const elcom = createTheme(federalTheme, {
  palette: {
    diverging: ["#51b581", "#a8dc90", "#e7ec83", "#f1b865", "#eb7c40"],
    categorical: ["#64afe9", "#01ADA1", "#939CB4", "#91C34B", "#E89F00"],
  },
});

elcom.typography = merge(elcom.typography, {
  lead: createTypographyVariant(federalTheme, {
    fontSize: ["0.875rem", "1rem"],
    lineHeight: ["1", "1"],
    fontWeight: 700,
    display: "block",
  }),
  meta: createTypographyVariant(federalTheme, {
    fontSize: [12, 14],
    lineHeight: [12.5, 16],
    fontWeight: 700,
    display: "block",
  }),
  giga: createTypographyVariant(federalTheme, {
    fontSize: ["2.5rem", "3rem"],
    lineHeight: "1.5",
    fontWeight: 700,
    display: "block",
  }),
});

export type ElcomTheme = typeof elcom;

export default elcom;
