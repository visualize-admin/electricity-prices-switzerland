import { Box } from "@mui/material";
import { markdown, TableSpecimen } from "catalog";

import theme from "../themes/elcom";

export default () => markdown`

### Spacings
The application uses a limited set of space variables to construct the user interface. This allows for great flexibility, while allowing to define relationships between elements on a global level.

${(
  <TableSpecimen
    rows={[0, 2, 4, 6, 8, 12, 24].map((s, i) => ({
      Variable: `space-${i}`,
      Measurement: theme.spacing(s),
      Space: <Space width={theme.spacing(s)} />,
    }))}
    span={4}
  />
)}
`;

const Space = ({ width }: { width: string | number }) => (
  <Box sx={{ width, height: "2rem", bgcolor: "brand" }} />
);
