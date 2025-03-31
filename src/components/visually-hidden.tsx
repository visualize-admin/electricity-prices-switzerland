import { visuallyHidden } from "@mui/utils";
import { ReactNode } from "react";

export const VisuallyHidden = ({ children }: { children: ReactNode }) => (
  <div style={visuallyHidden}>{children}</div>
);
