import { TableBody, TableCell, TableRow, Typography } from "@mui/material";

import ComparisonTable from "src/components/comparison-table";
import UnitValueWithTrend from "src/components/unit-value-with-trend";
import { RP_PER_KM } from "src/domain/metrics";
import { Trend } from "src/graphql/resolver-types";

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
              unit={RP_PER_KM}
              trend={Trend.Down}
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
              unit={RP_PER_KM}
              trend={Trend.Stable}
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
