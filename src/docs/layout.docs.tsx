import { markdown, TableSpecimen } from "catalog";
import { theme } from "../themes/elcom";
import { Box } from "theme-ui";

export default () => markdown`

### Spacings
The application uses a limited set of space-variables, to construct the user interface structure. This allows for the great flexibility, while allowing to define relationships between elements on a global level. The system of global space-variables is documented below:

${(
  <TableSpecimen
    rows={theme.space.map((s, i) => ({
      Variable: `space-${i}`,
      Measurement: s,
      Space: <Space width={s} />,
    }))}
    span={4}
  />
)}

`;

const Space = ({ width }: { width: string }) => (
  <Box sx={{ width, height: "2rem", bg: "darkgrey" }} />
);
