import { useTheme } from "../../themes";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.colors.monochrome600;
  const legendLabelColor = theme.colors.monochrome700;
  const domainColor = theme.colors.monochrome800;
  const gridColor = theme.colors.monochrome300;
  const axisLabelFontSize = 16;
  const axisLabelFontWeight = "bold";
  const axisLabelColor = theme.colors.monochrome800;
  const labelFontSize = 12;
  const fontFamily = theme.fonts.body;
  const annotationfontSize = 12;
  const annotationColor = theme.colors.monochrome900;
  const annotationLineColor = theme.colors.monochrome500;
  const annotationLabelUnderlineColor = theme.colors.monochrome700;
  const markBorderColor = theme.colors.monochrome100;
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
