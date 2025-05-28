import { palette } from "src/themes/palette";
import { typography } from "src/themes/typography";

export const useChartTheme = () => {
  const labelColor = palette.secondary[600];
  const legendLabelColor = palette.secondary[700];
  const domainColor = palette.secondary[800];
  const gridColor = palette.monochrome[200];
  const axisLabelFontSize = 16;
  const axisLabelFontWeight = 700;
  const axisLabelColor = palette.secondary[800];
  const labelFontSize = 12;
  const fontFamily = typography.fontFamily as string;
  const annotationFontSize = 12;
  const annotationColor = palette.secondary[900];
  const annotationLineColor = palette.secondary[500];
  const annotationLabelUnderlineColor = palette.secondary[700];
  const markBorderColor = palette.secondary[100];

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
    palette,
  };
};
