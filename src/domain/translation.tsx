import { i18n } from "@lingui/core";
import { t } from "@lingui/macro";
import { memoize } from "lodash";

import {
  ElectricityCategory,
  SettlementDensity,
  EnergyDensity,
} from "src/domain/data";

import { NetworkLevel, PeerGroup, SunshineIndicator } from "./sunshine";

const getTranslationTable = (_locale: string) => {
  const settlementDensities: Record<
    `peer-group.settlement-density.${LowercaseWithoutDots<SettlementDensity>}`,
    string
  > = {
    "peer-group.settlement-density.high": t({
      id: "peer-group.settlement-density.high",
      message: `High settlement density`,
    }),
    "peer-group.settlement-density.medium": t({
      id: "peer-group.settlement-density.medium",
      message: `Medium settlement density`,
    }),
    "peer-group.settlement-density.mountain": t({
      id: "peer-group.settlement-density.mountain",
      message: `Mountain region`,
    }),
    "peer-group.settlement-density.na": t({
      id: "peer-group.settlement-density.na",
      message: `Not specified`,
    }),
    "peer-group.settlement-density.rural": t({
      id: "peer-group.settlement-density.rural",
      message: `Rural settlement density`,
    }),
    "peer-group.settlement-density.tourist": t({
      id: "peer-group.settlement-density.tourist",
      message: `Tourism`,
    }),
  } as const;

  const energyDensities: Record<
    `peer-group.energy-density.${LowercaseWithoutDots<EnergyDensity>}`,
    string
  > = {
    "peer-group.energy-density.na": t({
      id: "peer-group.energy-density.na",
      message: `Not specified`,
    }),
    "peer-group.energy-density.high": t({
      id: "peer-group.energy-density.high",
      message: `High energy density`,
    }),
    "peer-group.energy-density.low": t({
      id: "peer-group.energy-density.low",
      message: `Low energy density`,
    }),
  } as const;

  const categories: Record<
    ElectricityCategory | `${ElectricityCategory}-long`,
    string
  > = {
    H1: t({ id: "selector.category.H1", message: "H1" }),
    H2: t({ id: "selector.category.H2", message: "H2" }),
    H3: t({ id: "selector.category.H3", message: "H3" }),
    H4: t({ id: "selector.category.H4", message: "H4" }),
    H5: t({ id: "selector.category.H5", message: "H5" }),
    H6: t({ id: "selector.category.H6", message: "H6" }),
    H7: t({ id: "selector.category.H7", message: "H7" }),
    H8: t({ id: "selector.category.H8", message: "H8" }),
    C1: t({ id: "selector.category.C1", message: "C1" }),
    C2: t({ id: "selector.category.C2", message: "C2" }),
    C3: t({ id: "selector.category.C3", message: "C3" }),
    C4: t({ id: "selector.category.C4", message: "C4" }),
    C5: t({ id: "selector.category.C5", message: "C5" }),
    C6: t({ id: "selector.category.C6", message: "C6" }),
    C7: t({ id: "selector.category.C7", message: "C7" }),

    // Long versions taken from the Kategorie Info Dialog
    "H1-long": t({
      id: "selector.category.H1-long",
      message: `H1 - 2-Room apartment with induction stove`,
    }),
    "H2-long": t({
      id: "selector.category.H2-long",
      message: `H2 - 4-room apartment with electric stove`,
    }),
    "H3-long": t({
      id: "selector.category.H3-long",
      message: `H3 - 4-room apartment with electric stove and electric boiler`,
    }),
    "H4-long": t({
      id: "selector.category.H4-long",
      message: `H4 - 5-room apartment with electric stove and dryer`,
    }),
    "H5-long": t({
      id: "selector.category.H5-long",
      message: `H5 - 5-room single-family house with electric stove, electric boiler, and dryer`,
    }),
    "H6-long": t({
      id: "selector.category.H6-long",
      message: `H6 - 5-room single-family house with electric resistance heating`,
    }),
    "H7-long": t({
      id: "selector.category.H7-long",
      message: `H7 - 5-room single-family house with heat pump for heating`,
    }),
    "H8-long": t({
      id: "selector.category.H8-long",
      message: `H8 - Large, highly electrified condominium`,
    }),

    "C1-long": t({
      id: "selector.category.C1-long",
      message: `C1 - Small business (<8 kW)`,
    }),
    "C2-long": t({
      id: "selector.category.C2-long",
      message: `C2 - Small business (<15 kW)`,
    }),
    "C3-long": t({
      id: "selector.category.C3-long",
      message: `C3 - Medium business (<50 kW)`,
    }),
    "C4-long": t({
      id: "selector.category.C4-long",
      message: `C4 - Large business (<150 kW, low voltage)`,
    }),
    "C5-long": t({
      id: "selector.category.C5-long",
      message: `C5 - Large business (<150 kW, medium voltage)`,
    }),
    "C6-long": t({
      id: "selector.category.C6-long",
      message: `C6 - Large business (<400 kW, medium voltage)`,
    }),
    "C7-long": t({
      id: "selector.category.C7-long",
      message: `C7 - Large business (<1,630 kW, medium voltage)`,
    }),
  };

  const indicators: Record<SunshineIndicator, string> = {
    saidi: t({
      id: "indicator.saidi",
      message: "Power Outage Duration (SAIDI)",
    }),
    saifi: t({
      id: "indicator.saifi",
      message: "Power Outage Frequency (SAIFI)",
    }),

    networkCosts: t({
      id: "indicator.networkCosts",
      message: "Network costs",
    }),
    netTariffs: t({
      id: "indicator.netTariffs",
      message: "Net tariffs",
    }),
    energyTariffs: t({
      id: "indicator.energyTariffs",
      message: "Energy tariffs",
    }),
    compliance: t({
      id: "indicator.compliance",
      message: "Compliance",
    }),
    outageInfo: t({
      id: "indicator.outage-info",
      message: "Outage information",
    }),
    daysInAdvanceOutageNotification: t({
      id: "indicator.days-in-advance-outage-notification",
      message: "Days in advance outage notification",
    }),
  };

  const networkLevels: Record<
    | `network-level.${NetworkLevel["id"]}.short`
    | `network-level.${NetworkLevel["id"]}.long`
    | `network-level.${NetworkLevel["id"]}.description`,
    string
  > = {
    // NE (Not yet sure about translations)
    "network-level.NE5.short": t({
      id: "network-level.NE5.short",
      message: `NE5`,
    }),
    "network-level.NE5.long": t({
      id: "network-level.NE5.long",
      message: `High voltage NE5`,
    }),
    "network-level.NE5.description": t({
      id: "network-level.NE5.description",
      message: `At Network Level NE5`,
    }),
    "network-level.NE6.short": t({
      id: "network-level.NE6.short",
      message: `NE6`,
    }),
    "network-level.NE6.description": t({
      id: "network-level.NE6.description",
      message: `At Network Level NE6`,
    }),
    "network-level.NE6.long": t({
      id: "network-level.NE6.long",
      message: `Medium voltage NE6`,
    }),

    "network-level.NE7.short": t({
      id: "network-level.NE7.short",
      message: `NE7`,
    }),
    "network-level.NE7.description": t({
      id: "network-level.NE7.description",
      message: `At Network Level NE7`,
    }),
    "network-level.NE7.long": t({
      id: "network-level.NE7.long",
      message: `Low voltage NE7`,
    }),
  };

  const table = {
    "collapsed-operator": t({
      id: "priceComponents.view.collapsed.municipalities",
      message: "Group municipalities",
    }),
    "expanded-operator": t({
      id: "priceComponents.view.expanded.municipalities",
      message: "Show individual municipalities",
    }),
    "collapsed-municipality": t({
      id: "priceComponents.view.collapsed.operators",
      message: "Grouping network operators",
    }),
    "expanded-municipality": t({
      id: "priceComponents.view.expanded.operators",
      message: "Show individual network operators",
    }),
    standard: t({ id: "selector.product.standard", message: "Standard" }),
    cheapest: t({ id: "selector.product.cheapest", message: "Cheapest" }),
    gridusage: t({
      id: "selector.pricecomponent.gridusage",
      message: "Grid usage",
    }),
    energy: t({ id: "selector.pricecomponent.energy", message: "Energy" }),
    charge: t({
      id: "selector.pricecomponent.charge",
      message: "Charges to the community",
    }),
    aidfee: t({
      id: "selector.pricecomponent.aidfee",
      message: "Grid surcharge pursuant to Art. 35 EnG",
    }),
    total: t({ id: "selector.pricecomponent.total", message: "Total" }),
    meteringrate: t({
      id: "selector.pricecomponent.meteringrate",
      message: "Metering Rate",
    }),
    annualmeteringcost: t({
      id: "selector.pricecomponent.annualmeteringcost",
      message: "Annual Metering Cost",
    }),
    "productvariety-trend": t({
      id: "sunshine.operational-standards.product-variety-trend",
      message: "Comparison of eco-friendly product diversity",
    }),
    "compliance-trend": t({
      id: "sunshine.operational-standards.compliance-trend",
      message: "Comparison of francs per invoice recipient",
    }),
    "servicequality-trend": t({
      id: "sunshine.operational-standards.service-quality-trend",
      message: "Comparison of advance notice periods for planned outages",
    }),

    ...categories,

    "H-group": t({ id: "selector.category.H-group", message: "Households" }),
    "C-group": t({
      id: "selector.category.C-group",
      message: "Commercial and industrial companies",
    }),
    period: t({ id: "filters.year", message: "Year" }),
    category: t({ id: "filters.category", message: "Category" }),
    product: t({ id: "filters.product", message: "Product" }),
    priceComponent: t({
      id: "filters.price.component",
      message: "Price component",
    }),
    OperatorResult: t({
      id: "search.result.operator",
      message: "Network operator",
    }),
    operator: t({ id: "search.result.operator", message: "Network operator" }),
    operators: t({
      id: "chart.annotation.operators",
      message: "Network operator",
    }),
    MunicipalityResult: t({
      id: "search.result.municipality",
      message: "Municipality",
    }),
    municipality: t({
      id: "search.result.municipality",
      message: "Municipality",
    }),
    municipalities: t({
      id: "chart.annotation.municipalities",
      message: "Municipalities",
    }),
    CantonResult: t({ id: "search.result.canton", message: "Canton" }),
    canton: t({ id: "search.result.canton", message: "Canton" }),
    cantons: t({ id: "chart.annotation.cantons", message: "Cantons" }),
    "median-asc": t({
      id: "rangeplot.select.sorting.median-asc",
      message: "Median ascending",
    }),
    "median-desc": t({
      id: "rangeplot.select.sorting.median-desc",
      message: "Median descending",
    }),
    "alpha-asc": t({
      id: "rangeplot.select.sorting.alpha-asc",
      message: "Alphabetically ascending",
    }),
    "alpha-desc": t({
      id: "rangeplot.select.sorting.alpha-desc",
      message: "Alphabetically descending",
    }),

    // Sunshine selectors labels
    "peer-group.all-grid-operators": t({
      id: "peer-group.all-grid-operators",
      message: "All grid operators",
    }),

    planned: t({
      id: "saidi-saify-type.planned",
      message: "Planned",
    }),
    unplanned: t({
      id: "saidi-saify-type.unplanned",
      message: "Unplanned",
    }),

    "franc-rule": t({
      id: "selector.compliance-type.franc-rule",
      message: "Franc rule",
    }),

    saidiSaifiType: t({
      id: "selector.saidi-saifi-type",
      message: "Typology",
    }),

    ...indicators,
    ...energyDensities,
    ...settlementDensities,

    "network-level": t({ id: "network-level", message: `Network level` }),

    ...networkLevels,

    "sunshine.select-all": t({
      id: "sunshine.select-all",
      message: `Select All`,
    }),
    "sunshine.costs-and-tariffs.selected-operators": t({
      id: "sunshine.costs-and-tariffs.selected-operators",
      message: `Selected network operators`,
    }),

    // ButtonGroup labels and content
    "power-stability.view-by": t({
      id: "sunshine.power-stability.view-by",
      message: "View By",
    }),
    "power-stability.latest-year-option": t({
      id: "sunshine.power-stability.latest-year-option",
      message: "Latest year",
    }),

    "power-stability.progress-over-time": t({
      id: "sunshine.power-stability.progress-over-time",
      message: "Progress over time",
    }),
    "power-stability.overall-option": t({
      id: "sunshine.power-stability.overall-option",
      message: "Overall",
    }),
    "power-stability.overall-tooltip": t({
      id: "sunshine.power-stability.overall-tooltip",
      message:
        "Shows the total outage duration per operator, combining planned and unplanned outages for direct comparison.",
    }),
    "power-stability.ratio-option": t({
      id: "sunshine.power-stability.ratio-option",
      message: "Ratio",
    }),
    "power-stability.ratio-tooltip": t({
      id: "sunshine.power-stability.ratio-tooltip",
      message:
        "Shows the ratio of unplanned outages to total outages, providing insight into the stability of the power supply.",
    }),
    "power-stability.duration": t({
      id: "sunshine.power-stability.duration",
      message: "Duration",
    }),
    "power-stability.total-option": t({
      id: "sunshine.power-stability.total-option",
      message: "Total",
    }),
    "power-stability.total-tooltip": t({
      id: "sunshine.power-stability.total-tooltip",
      message:
        "Shows the total outage duration per operator, combining planned and unplanned outages for direct comparison.",
    }),
    "power-stability.planned-option": t({
      id: "sunshine.power-stability.planned-option",
      message: "Planned",
    }),
    "power-stability.planned-tooltip": t({
      id: "sunshine.power-stability.planned-tooltip",
      message:
        "Shows only planned outages, which are scheduled maintenance or upgrades.",
    }),
    "power-stability.unplanned-option": t({
      id: "sunshine.power-stability.unplanned-option",
      message: "Unplanned",
    }),
    "power-stability.unplanned-tooltip": t({
      id: "sunshine.power-stability.unplanned-tooltip",
      message:
        "Shows only unplanned outages, which are unexpected interruptions.",
    }),

    "costs-and-tariffs.view-by": t({
      id: "sunshine.costs-and-tariffs.view-by",
      message: "View By",
    }),
    "costs-and-tariffs.latest-year-option": t({
      id: "sunshine.costs-and-tariffs.latest-year-option",
      message: "Latest year",
    }),
    "costs-and-tariffs.progress-over-time": t({
      id: "sunshine.costs-and-tariffs.progress-over-time",
      message: "Progress over time",
    }),

    "price-components.collapsed-content": t({
      id: "selector.priceComponents.collapsed-content",
      message: "Lorem ipsum",
    }),
    "price-components.expanded-content": t({
      id: "selector.priceComponents.expanded-content",
      message: "Lorem ipsum",
    }),
    "price-components.total-content": t({
      id: "selector.priceComponents.total-content",
      message: "Lorem ipsum",
    }),
    "price-components.gridusage-content": t({
      id: "selector.priceComponents.gridusage-content",
      message: "Lorem ipsum",
    }),
    "price-components.energy-content": t({
      id: "selector.priceComponents.energy-content",
      message: "Lorem ipsum",
    }),
    "price-components.charge-content": t({
      id: "selector.priceComponents.charge-content",
      message: "Lorem ipsum",
    }),
    "price-components.aidfee-content": t({
      id: "selector.priceComponents.aidfee-content",
      message: "Lorem ipsum",
    }),
    "price-components.meteringrate-content": t({
      id: "selector.priceComponents.meteringrate-content",
      message: "Lorem ipsum",
    }),
    "selector-tab.electricity": t({
      id: "selector.tab.electricity",
      message: "Electricity Tariffs",
    }),
    "selector-tab.electricity-content": t({
      id: "selector.tab.electricity-content",
      message: "Lorem ipsum",
    }),
    "selector-tab.indicators": t({
      id: "selector.tab.indicators",
      message: "Indicators",
    }),
    "selector-tab.indicators-content": t({
      id: "selector.tab.indicators-content",
      message: "Lorem ipsum",
    }),
  } as const;

  return table;
};
export type TranslationKey = keyof ReturnType<typeof getTranslationTable>;

type LowercaseWithoutDots<T> = T extends string
  ? Lowercase<T> extends infer L
    ? L extends string
      ? L extends `${infer P}.${infer Q}`
        ? LowercaseWithoutDots<`${P}${Q}`>
        : L
      : never
    : never
  : never;

const memoizeGetTranslationTable = memoize(getTranslationTable);

export const getLocalizedLabel = ({ id }: { id: TranslationKey }): string => {
  const locale = i18n.locale;
  const table = memoizeGetTranslationTable(locale);
  return table[id as keyof typeof table] || id;
};
/** @deprecated Refactor to use getLocalizedLabel */
export const getLocalizedLabelUnsafe = ({ id }: { id: string }): string => {
  const locale = i18n.locale;
  const table = memoizeGetTranslationTable(locale);
  return table[id as keyof typeof table] || id;
};

export const getPeerGroupLabels = (peerGroup: PeerGroup) => {
  const settlementDensityLabel = getLocalizedLabel({
    id: `peer-group.settlement-density.${
      (peerGroup.settlementDensity?.toLowerCase().replace(/\./g, "") ??
        "na") as SettlementDensity
    }` as `peer-group.settlement-density.${LowercaseWithoutDots<SettlementDensity>}`,
  });
  const energyDensityLabel = getLocalizedLabel({
    id: `peer-group.energy-density.${
      peerGroup.energyDensity?.toLowerCase().replace(/\./g, "") ?? "na"
    }` as `peer-group.energy-density.${LowercaseWithoutDots<EnergyDensity>}`,
  });

  const peerGroupLabel = `${settlementDensityLabel} / ${energyDensityLabel}`;
  return {
    peerGroupLabel,
    settlementDensityLabel,
    energyDensityLabel,
  };
};

export const getNetworkLevelLabels = (networkLevel: NetworkLevel) => ({
  short: getLocalizedLabel({ id: `network-level.${networkLevel.id}.short` }),
  long: getLocalizedLabel({ id: `network-level.${networkLevel.id}.long` }),
});

export const getCategoryLabels = (category: ElectricityCategory) => ({
  short: getLocalizedLabel({ id: `${category}` }),
  long: getLocalizedLabel({ id: `${category}-long` }),
});
