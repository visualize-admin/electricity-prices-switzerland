import { useTheme } from "../../themes";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.colors.grey[600];
  const legendLabelColor = theme.colors.grey[700];
  const domainColor = theme.colors.grey[800];
  const gridColor = theme.colors.grey[300];
  const axisLabelFontSize = 16;
  const axisLabelFontWeight = "bold";
  const axisLabelColor = theme.colors.grey[800];
  const labelFontSize = 12;
  const fontFamily = theme.fonts.body;
  const annotationfontSize = 12;
  const annotationColor = theme.colors.grey[900];
  const annotationLineColor = theme.colors.grey[500];
  const annotationLabelUnderlineColor = theme.colors.grey[700];
  const markBorderColor = theme.colors.grey[100];
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
    palettes: theme.palettes,
    markBorderColor,
  };
};
