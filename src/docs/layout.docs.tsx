import { markdown, TableSpecimen } from "catalog";
import { Box } from "@mui/material";

import { theme } from "../themes/elcom";

export default () => markdown`

### Spacings
The application uses a limited set of space variables to construct the user interface. This allows for great flexibility, while allowing to define relationships between elements on a global level.

${
  Array.isArray(theme.space) ? (
    <TableSpecimen
      rows={theme.space.map((s, i) => ({
        Variable: `space-${i}`,
        Measurement: s,
        Space: <Space width={s} />,
      }))}
      span={4}
    />
  ) : (
    <Box>Space: {theme.space}</Box>
  )
}
`;

const Space = ({ width }: { width: string | number }) => (
  <Box sx={{ width, height: "2rem", bg: "brand" }} />
);
