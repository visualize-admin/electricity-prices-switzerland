import { useTheme } from "@mui/material";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.palette.grey[600];
  const legendLabelColor = theme.palette.grey[700];
  const domainColor = theme.palette.grey[800];
  const gridColor = theme.palette.grey[300];
  const axisLabelFontSize = 16;
  const axisLabelFontWeight = "bold";
  const axisLabelColor = theme.palette.grey[800];
  const labelFontSize = 12;
  const fontFamily = theme.fonts.body;
  const annotationfontSize = 12;
  const annotationColor = theme.palette.grey[900];
  const annotationLineColor = theme.palette.grey[500];
  const annotationLabelUnderlineColor = theme.palette.grey[700];
  const markBorderColor = theme.palette.grey[100];
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
    annotationfontSize,
    annotationColor,
    annotationLineColor,
    annotationLabelUnderlineColor,
    markBorderColor,
    palette: theme.palette,
  };
};
