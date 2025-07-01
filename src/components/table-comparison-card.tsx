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

import { YearlyNavigation, YearlyNavigationProps } from "./sunshine-tabs";

const TableComparisonCard: React.FC<
  {
    title: React.ReactNode;
    subtitle: React.ReactNode;

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
  } & Omit<CardProps, "title" | "subtitle" | "rows"> &
    Partial<YearlyNavigationProps>
> = ({
  title,
  subtitle,
  rows,
  linkContent,
  activeTab,
  handleTabChange,
  ...props
}) => (
  <Card {...props}>
    <CardContent>
      <Typography variant="h3" gutterBottom>
        {title}
      </Typography>
      {(!activeTab || !handleTabChange) && (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      {activeTab && handleTabChange && (
        <YearlyNavigation
          activeTab={activeTab}
          handleTabChange={handleTabChange}
        />
      )}
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
