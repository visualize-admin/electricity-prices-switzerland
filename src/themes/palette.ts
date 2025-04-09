import { c as colors } from "@interactivethings/swiss-federal-ci";
import { type ThemeOptions } from "@mui/material";

export const palette = {
  ...colors,
  text: {
    primary: colors.monochrome[800],
  },
  primary: {
    main: "#D8232A",
    contrastText: "#FFFFFF",
  },
  cobalt: {
    main: colors.cobalt[700],
    ...colors.cobalt,
  },
  secondary: {
    main: colors.cobalt[700],
    ...colors.cobalt,
  },
  monochrome: {
    main: colors.monochrome[700],
    ...colors.monochrome,
  },
  red: {
    main: colors.red[700],
    ...colors.red,
  },
  yellow: {
    main: "#B45309",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  green: {
    main: "#047857",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  blue: {
    main: "#1D4ED8",
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  diverging: ["#51b581", "#a8dc90", "#e7ec83", "#f1b865", "#eb7c40"],
  categorical: ["#64afe9", "#01ADA1", "#939CB4", "#91C34B", "#E89F00"],
} satisfies ThemeOptions["palette"];
