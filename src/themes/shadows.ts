import { e } from "@interactivethings/swiss-federal-ci";
import { Shadows } from "@mui/material/styles/shadows";

export const shadows = Array.from({ length: 25 }, (_, i) => {
  const index = Math.floor(i / 4);
  return e[Math.min(index, e.length - 1)];
}) as Shadows;
