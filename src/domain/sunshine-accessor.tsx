import { property } from "lodash";

import { NetworkLevel } from "./sunshine";
import { SunshineDataRow } from "src/graphql/queries";
import { TariffCategory } from "src/graphql/resolver-mapped-types";

const isDefined = (x: number | undefined | null): x is number =>
  x !== undefined && x !== null;
const accessorsByAttribute: Record<
  string,
  (x: SunshineDataRow) => number | undefined
> = {
  saidiTotal: property("saidiTotal"),
  saidiUnplanned: property("saidiUnplanned"),
  saidiPlanned: (x) => {
    if (isDefined(x.saidiTotal) && isDefined(x.saidiUnplanned)) {
      return x.saidiTotal - x.saidiUnplanned;
    }
  },
  saifiTotal: property("saifiTotal"),
  saifiUnplanned: property("saifiUnplanned"),
  saifiPlanned: (x) => {
    if (isDefined(x.saifiTotal) && isDefined(x.saifiUnplanned)) {
      return x.saifiTotal - x.saifiUnplanned;
    }
  },
  networkCostsNE5: property("networkCostsNE5"),
  networkCostsNE6: property("networkCostsNE6"),
  networkCostsNE7: property("networkCostsNE7"),

  tariffEC2: property("tariffEC2"),
  tariffEC3: property("tariffEC3"),
  tariffEC4: property("tariffEC4"),
  tariffEC6: property("tariffEC6"),
  tariffEH2: property("tariffEH2"),
  tariffEH4: property("tariffEH4"),
  tariffEH7: property("tariffEH7"),
  tariffNC2: property("tariffNC2"),
  tariffNC3: property("tariffNC3"),
  tariffNC4: property("tariffNC4"),
  tariffNC6: property("tariffNC6"),
  tariffNH2: property("tariffNH2"),
  tariffNH4: property("tariffNH4"),
  tariffNH7: property("tariffNH7"),

  infoDaysInAdvance: property("infoDaysInAdvance"),
  timely: property("timely"),
};
export function getSunshineAccessor(
  indicator: string,
  typology: string,
  networkLevel: NetworkLevel["id"],
  netTariffCategory: TariffCategory,
  energyTariffCategory: TariffCategory
): (r: SunshineDataRow) => number | undefined {
  if (indicator === "saidi" || indicator === "saifi") {
    return typology === "total"
      ? accessorsByAttribute[`${indicator}Total`]
      : typology === "unplanned"
      ? accessorsByAttribute[`${indicator}Unplanned`]
      : accessorsByAttribute[`${indicator}Planned`];
  }
  if (indicator === "networkCosts") {
    return accessorsByAttribute[`networkCosts${networkLevel}`];
  }
  if (indicator === "netTariffs") {
    return accessorsByAttribute[`tariff${netTariffCategory}`];
  }
  if (indicator === "energyTariffs") {
    return accessorsByAttribute[`tariff${energyTariffCategory}`];
  }
  if (indicator === "serviceQuality") {
    return accessorsByAttribute.infoDaysInAdvance;
  }
  if (indicator === "compliance") {
    return accessorsByAttribute.timely;
  }
  throw new Error("Invalid indicator: " + indicator);
}
