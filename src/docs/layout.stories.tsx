import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import theme from "../themes/elcom";

export const Layout = () => (
  <Stack spacing={4} sx={{ maxWidth: 800 }}>
    <Typography variant="h2">Spacing</Typography>
    <Typography variant="body1">
      The application uses a limited set of space variables to construct the
      user interface. This allows for great flexibility, while allowing to
      define relationships between elements on a global level.
    </Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Variable</TableCell>
          <TableCell>Measurement</TableCell>
          <TableCell>Space</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[0, 2, 4, 6, 8].map((s, i) => (
          <TableRow>
            <TableCell>{`space-${i}`}</TableCell>
            <TableCell>{theme.spacing(s)}</TableCell>
            <TableCell>
              <Space width={theme.spacing(s)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Stack>
);

const Space = ({ width }: { width: string | number }) => (
  <Box sx={{ width, height: "2rem", bgcolor: "brand.main" }} />
);

export default {
  title: " Components / Layout",
  component: Layout,
};
