import { extent, scaleThreshold } from "d3";
import { useMemo } from "react";

import { chartPalette } from "src/themes/palette";

const getDomainFromMedianValue = (medianValue: number | undefined) => {
  const m = medianValue ?? 0;
  const domain = [m * 0.85, m * 0.95, m * 1.05, m * 1.15];
  return domain;
};

export const useColorScale = <T>(options: {
  observations: T[];
  medianValue?: number | undefined;
  accessor: (x: T) => number | undefined;
}) => {
  return useMemo(() => {
    const domain =
      "medianValue" in options
        ? getDomainFromMedianValue(options.medianValue)
        : (extent(options.observations, (d) => options.accessor(d)) as [
            number,
            number
          ]);
    const scale = scaleThreshold<number, string>()
      .domain(domain)
      .range(chartPalette.diverging.GreenToOrange);

    return scale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.medianValue, options.observations, options.accessor]);
};
