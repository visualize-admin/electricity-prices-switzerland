/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `theme` should be a plain object, conforming to the `Theme` type.
 */
import {
  b as breakpoints,
  s as spacing,
} from "@interactivethings/swiss-federal-ci";
import { createTheme } from "@mui/material/styles";

import { components } from "src/themes/components";

import { palette } from "./palette";
import { shadows } from "./shadows";
import { typography } from "./typography";

export const theme = createTheme({
  breakpoints,
  shadows,
  spacing,
  palette,
  typography,
});

theme.components = components(theme);

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/fonts/NotoSans-Regular.woff2",
  "/fonts/NotoSans-Bold.woff2",
];
