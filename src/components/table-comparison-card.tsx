import {
  Typography,
  Card,
  CardContent,
  TableBody,
  TableRow,
  TableCell,
  CardProps,
} from "@mui/material";
import React from "react";

import ComparisonTable from "src/components/comparison-table";
import UnitValueWithTrend from "src/components/unit-value-with-trend";

export type Trend = "stable" | "increasing" | "decreasing";

const TableComparisonCard: React.FC<
  {
    title: React.ReactNode;
    subtitle: React.ReactNode;
    rows: {
      label: React.ReactNode;
      value:
        | { value: number; unit: string; trend: Trend; round?: number }
        | { value: React.ReactElement | string };
    }[];
  } & Omit<CardProps, "title" | "subtitle" | "rows">
> = ({ title, subtitle, rows, ...props }) => (
  <Card {...props}>
    <CardContent>
      <Typography variant="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle2" color="text.  secondary" gutterBottom>
        {subtitle}
      </Typography>
      <ComparisonTable size="small">
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body3" color="text.secondary">
                  {row.label}
                </Typography>
              </TableCell>
              <TableCell>
                {"unit" in row.value ? (
                  <UnitValueWithTrend
                    value={row.value.value}
                    unit={row.value.unit}
                    trend={row.value.trend}
                    round={row.value.round}
                  />
                ) : (
                  <Typography variant="body3">{row.value.value}</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ComparisonTable>
    </CardContent>
  </Card>
);

export default TableComparisonCard;
