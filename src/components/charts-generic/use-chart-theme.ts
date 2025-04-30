import { useTheme } from "@mui/material";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.palette.secondary[600];
  const legendLabelColor = theme.palette.secondary[700];
  const domainColor = theme.palette.secondary[800];
  const gridColor = theme.palette.secondary[300];
  const axisLabelFontSize = 16;
  const axisLabelFontWeight = "bold";
  const axisLabelColor = theme.palette.secondary[800];
  const labelFontSize = 12;
  const fontFamily = theme.typography.fontFamily as string;
  const annotationFontSize = 12;
  const annotationColor = theme.palette.secondary[900];
  const annotationLineColor = theme.palette.secondary[500];
  const annotationLabelUnderlineColor = theme.palette.secondary[700];
  const markBorderColor = theme.palette.secondary[100];

  return {
    axisLabelFontSize,
    axisLabelColor,
    axisLabelFontWeight,
    labelColor,
    labelFontSize,
    domainColor,
    gridColor,
    legendLabelColor,
    fontFamily,
    annotationFontSize,
    annotationColor,
    annotationLineColor,
    annotationLabelUnderlineColor,
    markBorderColor,
    palette: theme.palette,
  };
};
