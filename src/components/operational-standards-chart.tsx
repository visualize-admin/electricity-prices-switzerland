import { Box } from "@mui/material";

import type { SunshineOperationalStandardsData } from "src/domain/data";

export const ServiceQualityChart = ({
  data,
  id,
  operatorLabel,
}: {
  data: SunshineOperationalStandardsData["serviceQuality"];
  id: string;
  operatorLabel: string;
}) => {
  const { operatorsNotificationPeriodDays: observations } = data;
  return <Box sx={{ mt: 8 }}></Box>;
};

export const ComplianceChart = ({
  data,
  id,
  operatorLabel,
}: {
  data: SunshineOperationalStandardsData["compliance"];
  id: string;
  operatorLabel: string;
}) => {
  const { operatorsFrancsPerInvoice: observations } = data;
  return <Box sx={{ mt: 8 }}></Box>;
};
