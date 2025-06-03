import { TableBody, TableRow, TableCell, Typography } from "@mui/material";

import ComparisonTable from "src/components/comparison-table";
import UnitValueWithTrend from "src/components/unit-value-with-trend";

export const Example = () => {
  const operatorLabel = "Operator XYZ";
  const operatorRate = 1500;
  const peerGroupMedianRate = 1200;
  return (
    <ComparisonTable size="small">
      <TableBody>
        <TableRow>
          <TableCell>
            <Typography variant="body3" color="text.secondary">
              {operatorLabel}
            </Typography>
          </TableCell>
          <TableCell>
            <UnitValueWithTrend
              value={operatorRate}
              unit="Rp./km"
              trend="stable"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography variant="body3" color="text.secondary">
              Median Peer Group
            </Typography>
          </TableCell>
          <TableCell>
            <UnitValueWithTrend
              value={peerGroupMedianRate}
              unit="Rp./km"
              trend="stable"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </ComparisonTable>
  );
};

const meta = {
  title: "Components/ComparisonTable",
  component: ComparisonTable,
  parameters: {
    layout: "centered",
  },
};

export default meta;
