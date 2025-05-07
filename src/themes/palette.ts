import { c as colors } from "@interactivethings/swiss-federal-ci";
import { type ThemeOptions } from "@mui/material";

export const palette = {
  ...colors,
  text: {
    primary: colors.monochrome[800],
    ...colors.monochrome,
  },
  primary: {
    main: "#D8232A",
    contrastText: "#FFFFFF",
    ...colors.red,
  },
  secondary: {
    main: colors.cobalt[400],
    ...colors.cobalt,
  },
  monochrome: {
    main: colors.monochrome[800],
    ...colors.monochrome,
  },
} satisfies ThemeOptions["palette"];

export const chartPalette = {
  categorical: [
    "#3B82F6",
    "#F59E0B",
    "#EC4899",
    "#0D8B96",
    "#8655F6",
    "#059669",
    "#EA580C",
  ],
  sequential: {
    orange: ["#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#C2410C"],
    yellow: ["#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309"],
    green: ["#A7F3D0", "#6EE7B7", "#34D399", "#10B981", "#059669", "#047857"],
    teal: ["#98F6F3", "#5DE8EA", "#2BCED4", "#14AFB8", "#0D8B96", "#0F6B75"],
    blue: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8"],
    indigo: ["#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1", "#4338CA"],
    purple: ["#EDE9FE", "#DDD6FE", "#C4B5FD", "#A78BFA", "#8B5CF6", "#7C3AED"],
    pink: ["#FBCFE8", "#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#BE185D"],
  },
  diverging: {
    GreenToOrange: ["#059669", "#34D399", "#E4D78C", "#FB923C", "#EA580C"],
    BlueToPink: ["#2563EB", "#60A5FA", "#CEC3DE", "#F472B6", "#DB2777"],
  },
};
