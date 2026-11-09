import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";

import { SectionProps } from "src/components/detail-page/card";
import { Hint } from "src/components/hint";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import {
  ObservationKind,
  useObservationsWithAllPriceComponentsQuery,
} from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

type OperatorsWithoutPrices = {
  operatorIds: string[];
  operatorNames: Map<string, string>;
};

/**
 * Selected operators that do not have any price observations for the current
 * filters. Used to warn that a comparison is missing some of its operators.
 */
export const useOperatorsWithoutPrices = ({
  id,
  entity,
}: SectionProps): OperatorsWithoutPrices => {
  const locale = useLocale();
  const [{ period, municipality, operator, canton, category, product }] =
    useQueryStateEnergyPricesDetails();

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "operator"
      ? operator
      : canton;
  const entityIds = comparisonIds?.some((entityId) => entityId !== "")
    ? [...comparisonIds, id]
    : [id];

  const [query] = useObservationsWithAllPriceComponentsQuery({
    variables: {
      locale,
      filters: {
        period,
        [entity]: entityIds,
        category,
        product,
      },
      observationKind:
        entity === "canton"
          ? ObservationKind.Canton
          : ObservationKind.Municipality,
      operatorIds: entity === "operator" ? entityIds : [],
    },
    pause: entity !== "operator",
  });

  if (entity !== "operator" || query.fetching || !query.data) {
    return { operatorIds: [], operatorNames: new Map<string, string>() };
  }

  const operatorNames = new Map(
    (query.data.operators ?? []).map((o) => [o.id, o.name])
  );
  const observedOperatorIds = new Set(
    (query.data.observations ?? []).map((o) => o.operator)
  );

  return {
    operatorIds: entityIds.filter(
      (operatorId) => !observedOperatorIds.has(operatorId)
    ),
    operatorNames,
  };
};

export const OperatorsWithoutPricesHint = ({
  operatorIds,
  operatorNames,
}: OperatorsWithoutPrices) => {
  if (operatorIds.length === 0) {
    return null;
  }

  return (
    <Box data-testid="operators-without-prices">
      <Hint severity="warning">
        <Trans id="price-components.operators-without-prices">
          We have no prices for the following operators:
        </Trans>
        <Box component="ul" m={0} pl={5}>
          {operatorIds.map((operatorId) => (
            <li key={operatorId}>
              {operatorNames.get(operatorId) ?? operatorId}
            </li>
          ))}
        </Box>
      </Hint>
    </Box>
  );
};
