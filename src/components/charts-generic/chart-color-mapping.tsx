import type { GenericObservation } from "src/domain/data";
import { peerGroupOperatorName } from "src/domain/sunshine";
import { chartPalette, palette as themePalette } from "src/themes/palette";

export const getChartColorMapping = <T extends GenericObservation>({
  colorMapping,
  operatorLabel,
  observations,
  entityField = "operator_id",
}: {
  colorMapping?: Record<string, string>;
  operatorLabel: string;
  observations: T[];
  entityField?: string;
}) => {
  const baseMapping: Array<{ label: string; color: string }> = [
    { label: operatorLabel, color: chartPalette.categorical[0] },
    { label: peerGroupOperatorName, color: themePalette.text.primary },
  ];

  if (colorMapping) {
    // Add colors from the provided colorMapping for other operators
    const additionalMappings = Object.entries(colorMapping).map(
      ([operatorId, color]) => {
        // Find the operator name from the observations
        const observation = observations.find(
          (obs) => String(obs[entityField]) === operatorId
        );
        const operatorName = observation?.operator_name || operatorId;
        return { label: String(operatorName), color };
      }
    );

    return [...baseMapping, ...additionalMappings];
  }

  return baseMapping;
};
