import { useTheme } from "../../themes";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.colors.monochrome800;
  const legendLabelColor = theme.colors.monochrome700;
  const domainColor = theme.colors.monochrome800;
  const gridColor = theme.colors.monochrome300;
  const labelFontSize = 12;
  const fontFamily = theme.fonts.body;
  const annotationfontSize = 14;
  const annotationColor = theme.colors.monochrome900;
  return {
    labelColor,
    labelFontSize,
    domainColor,
    gridColor,
    legendLabelColor,
    fontFamily,
    annotationfontSize,
    annotationColor,
    palettes: theme.palettes
  };
};
