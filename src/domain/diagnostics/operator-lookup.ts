import { Client } from "urql";

import { OperatorsDocument, OperatorsQuery } from "src/graphql/queries";

export class OperatorNotFoundError extends Error {
  code = "OPERATOR_NOT_FOUND" as const;
}

/**
 * Resolves an operator id or name (case-insensitive) to its id/name, using
 * the same `searchOperators` query the map's operator search uses. Shared by
 * report modules that accept an operator id or name on the command line.
 */
export async function resolveOperator(
  client: Client,
  locale: string,
  idOrName: string
): Promise<{ id: string; name: string }> {
  const result = await client
    .query<OperatorsQuery>(OperatorsDocument, {
      locale,
      query: idOrName,
      ids: [idOrName],
    })
    .toPromise();
  if (result.error) throw result.error;

  const operators = result.data?.operators ?? [];
  const operator =
    operators.find((o) => o.id === idOrName) ??
    operators.find((o) => o.name.toLowerCase() === idOrName.toLowerCase());

  if (!operator) {
    throw new OperatorNotFoundError(`Operator not found: ${idOrName}`);
  }

  return operator;
}
