import { describe, expect, it } from "vitest";

import { OperatorObservationFieldsFragment } from "src/graphql/queries";

import { groupsFromElectricityMunicipalities } from "./list-groups";

const obs = (
  overrides: Partial<OperatorObservationFieldsFragment> &
    Pick<
      OperatorObservationFieldsFragment,
      "municipality" | "operator" | "value"
    >
): OperatorObservationFieldsFragment => ({
  __typename: "OperatorObservation",
  period: "2027",
  municipalityLabel: overrides.municipality,
  operatorLabel: "Primeo Netz AG",
  canton: "BL",
  cantonLabel: "Basel-Landschaft",
  category: "H4",
  coverageRatio: 1,
  ...overrides,
});

describe("groupsFromElectricityMunicipalities", () => {
  it("uses the current municipality's operator value, not the first nationwide row", () => {
    // Primeo / ELC-722: same operator, different municipal levies.
    // Münchenstein appears first in the nationwide array; Therwil must
    // still keep 31.61, not inherit 31.20.
    const groups = groupsFromElectricityMunicipalities([
      obs({
        municipality: "2769",
        municipalityLabel: "Münchenstein",
        operator: "primeo",
        value: 31.2,
      }),
      obs({
        municipality: "2773",
        municipalityLabel: "Therwil",
        operator: "primeo",
        value: 31.61,
      }),
    ]);

    const byId = Object.fromEntries(groups) as Record<
      string,
      { value: number; operators?: { value: number }[] }
    >;

    expect(byId["2769"].value).toBe(31.2);
    expect(byId["2769"].operators).toEqual([
      { id: "primeo", label: "Primeo Netz AG", value: 31.2 },
    ]);
    expect(byId["2773"].value).toBe(31.61);
    expect(byId["2773"].operators).toEqual([
      { id: "primeo", label: "Primeo Netz AG", value: 31.61 },
    ]);
  });
});
