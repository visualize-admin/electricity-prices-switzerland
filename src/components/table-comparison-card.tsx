import {
  Card,
  CardContent,
  CardProps,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

import ComparisonTable from "src/components/comparison-table";
import UnitValueWithTrend from "src/components/unit-value-with-trend";
import { Trend } from "src/graphql/resolver-types";

const TableComparisonCard: React.FC<
  {
    title: React.ReactNode;
    subtitle: React.ReactNode;
    description?: React.ReactNode;

    linkContent?: React.ReactNode;
    rows: {
      label: React.ReactNode;
      value:
        | {
            value: number;
            unit: string;
            trend: Trend | undefined | null;
            round?: number;
          }
        | { value: React.ReactElement | string };
    }[];
  } & Omit<CardProps, "title" | "subtitle" | "rows">
> = ({ title, subtitle, rows, linkContent, description, ...props }) => (
  <Card {...props}>
    <CardContent>
      <Typography variant="h3" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.primary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      {description}
      <ComparisonTable size="small">
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell sx={{ width: "100% !important" }}>
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
      <Stack
        sx={{
          mt: 2,
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        {linkContent}
      </Stack>
    </CardContent>
  </Card>
);

export default TableComparisonCard;
