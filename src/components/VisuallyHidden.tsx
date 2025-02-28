import { visuallyHidden } from "@mui/utils";

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <div style={visuallyHidden}>{children}</div>
);

export default VisuallyHidden;
