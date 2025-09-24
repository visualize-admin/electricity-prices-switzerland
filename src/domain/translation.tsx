import { t } from "@lingui/macro";

import { ElectricityCategory } from "src/domain/data";

import { NetworkLevel, PeerGroup } from "./sunshine";

export const getLocalizedLabel = ({ id }: { id: string }): string => {
  switch (id) {
    case "collapsed-operator":
      return t({
        id: "priceComponents.view.collapsed.municipalities",
        message: "Group municipalities",
      });
    case "expanded-operator":
      return t({
        id: "priceComponents.view.expanded.municipalities",
        message: "Show individual municipalities",
      });
    case "collapsed-municipality":
      return t({
        id: "priceComponents.view.collapsed.operators",
        message: "Grouping network operators",
      });
    case "expanded-municipality":
      return t({
        id: "priceComponents.view.expanded.operators",
        message: "Show individual network operators",
      });
    case "standard":
      return t({ id: "selector.product.standard", message: "Standard" });
    case "cheapest":
      return t({ id: "selector.product.cheapest", message: "Cheapest" });
    case "gridusage":
      return t({
        id: "selector.pricecomponent.gridusage",
        message: "Grid usage",
      });
    case "energy":
      return t({ id: "selector.pricecomponent.energy", message: "Energy" });
    case "charge":
      return t({
        id: "selector.pricecomponent.charge",
        message: "Charges to the community",
      });
    case "aidfee":
      return t({
        id: "selector.pricecomponent.aidfee",
        message: "Grid surcharge pursuant to Art. 35 EnG",
      });
    case "total":
      return t({ id: "selector.pricecomponent.total", message: "Total" });
    case "meteringrate":
      return t({
        id: "selector.pricecomponent.meteringrate",
        message: "Metering Rate",
      });
    case "annualmeteringcost":
      return t({
        id: "selector.pricecomponent.annualmeteringcost",
        message: "Annual Metering Cost",
      });
    case "productvariety-trend":
      return t({
        id: "sunshine.operational-standards.product-variety-trend",
        message: "Comparison of eco-friendly product diversity",
      });
    case "compliance-trend":
      return t({
        id: "sunshine.operational-standards.compliance-trend",
        message: "Comparison of francs per invoice recipient",
      });
    case "servicequality-trend":
      return t({
        id: "sunshine.operational-standards.service-quality-trend",
        message: "Comparison of advance notice periods for planned outages",
      });
    case "H1":
      return t({ id: "selector.category.H1", message: "H1" });
    case "H2":
      return t({ id: "selector.category.H2", message: "H2" });
    case "H3":
      return t({ id: "selector.category.H3", message: "H3" });
    case "H4":
      return t({ id: "selector.category.H4", message: "H4" });
    case "H5":
      return t({ id: "selector.category.H5", message: "H5" });
    case "H6":
      return t({ id: "selector.category.H6", message: "H6" });
    case "H7":
      return t({ id: "selector.category.H7", message: "H7" });
    case "H8":
      return t({ id: "selector.category.H8", message: "H8" });
    case "C1":
      return t({ id: "selector.category.C1", message: "C1" });
    case "C2":
      return t({ id: "selector.category.C2", message: "C2" });
    case "C3":
      return t({ id: "selector.category.C3", message: "C3" });
    case "C4":
      return t({ id: "selector.category.C4", message: "C4" });
    case "C5":
      return t({ id: "selector.category.C5", message: "C5" });
    case "C6":
      return t({ id: "selector.category.C6", message: "C6" });
    case "C7":
      return t({ id: "selector.category.C7", message: "C7" });

    // Long versions taken from the Kategorie Info Dialog
    case "H1-long":
      return t({
        id: "selector.category.H1-long",
        message: `H1 - 2-Room apartment with induction stove`,
      });
    case "H2-long":
      return t({
        id: "selector.category.H2-long",
        message: `H2 - 4-room apartment with electric stove`,
      });
    case "H3-long":
      return t({
        id: "selector.category.H3-long",
        message: `H3 - 4-room apartment with electric stove and electric boiler`,
      });
    case "H4-long":
      return t({
        id: "selector.category.H4-long",
        message: `H4 - 5-room apartment with electric stove and dryer`,
      });
    case "H5-long":
      return t({
        id: "selector.category.H5-long",
        message: `H5 - 5-room single-family house with electric stove, electric boiler, and dryer`,
      });
    case "H6-long":
      return t({
        id: "selector.category.H6-long",
        message: `H6 - 5-room single-family house with electric resistance heating`,
      });
    case "H7-long":
      return t({
        id: "selector.category.H7-long",
        message: `H7 - 5-room single-family house with heat pump for heating`,
      });
    case "H8-long":
      return t({
        id: "selector.category.H8-long",
        message: `H8 - Large, highly electrified condominium`,
      });

    case "C1-long":
      return t({
        id: "selector.category.C1-long",
        message: `C1 - Small business (<8 kW)`,
      });
    case "C2-long":
      return t({
        id: "selector.category.C2-long",
        message: `C2 - Small business (<15 kW)`,
      });
    case "C3-long":
      return t({
        id: "selector.category.C3-long",
        message: `C3 - Medium business (<50 kW)`,
      });
    case "C4-long":
      return t({
        id: "selector.category.C4-long",
        message: `C4 - Large business (<150 kW, low voltage)`,
      });
    case "C5-long":
      return t({
        id: "selector.category.C5-long",
        message: `C5 - Large business (<150 kW, medium voltage)`,
      });
    case "C6-long":
      return t({
        id: "selector.category.C6-long",
        message: `C6 - Large business (<400 kW, medium voltage)`,
      });
    case "C7-long":
      return t({
        id: "selector.category.C7-long",
        message: `C7 - Large business (<1,630 kW, medium voltage)`,
      });

    case "H-group":
      return t({ id: "selector.category.H-group", message: "Households" });
    case "C-group":
      return t({
        id: "selector.category.C-group",
        message: "Commercial and industrial companies",
      });
    case "period":
      return t({ id: "filters.year", message: "Year" });
    case "category":
      return t({ id: "filters.category", message: "Category" });
    case "product":
      return t({ id: "filters.product", message: "Product" });
    case "priceComponent":
      return t({ id: "filters.price.component", message: "Price component" });
    case "OperatorResult":
    case "operator":
      return t({ id: "search.result.operator", message: "Network operator" });
    case "operators":
      return t({
        id: "chart.annotation.operators",
        message: "Network operator",
      });
    case "MunicipalityResult":
    case "municipality":
      return t({ id: "search.result.municipality", message: "Municipality" });
    case "municipalities":
      return t({
        id: "chart.annotation.municipalities",
        message: "Municipalities",
      });
    case "CantonResult":
    case "canton":
      return t({ id: "search.result.canton", message: "Canton" });
    case "cantons":
      return t({ id: "chart.annotation.cantons", message: "Cantons" });
    case "median-asc":
      return t({
        id: "rangeplot.select.sorting.median-asc",
        message: "Median ascending",
      });
    case "median-desc":
      return t({
        id: "rangeplot.select.sorting.median-desc",
        message: "Median descending",
      });
    case "alpha-asc":
      return t({
        id: "rangeplot.select.sorting.alpha-asc",
        message: "Alphabetically ascending",
      });
    case "alpha-desc":
      return t({
        id: "rangeplot.select.sorting.alpha-desc",
        message: "Alphabetically descending",
      });

    // Sunshine selectors labels
    case "peer-group.all-grid-operators":
      return t({
        id: "peerGroup.all_grid_operators",
        message: "All grid operators",
      });
    case "peer-group.A":
      return t({
        id: "peerGroup.A",
        message: "High energy density / Medium settlement density",
      });
    case "peer-group.B":
      return t({
        id: "peerGroup.B",
        message: "High energy density / Rural settlement density",
      });
    case "peer-group.C":
      return t({
        id: "peerGroup.C",
        message: "High energy density / Mountain region",
      });
    case "peer-group.D":
      return t({ id: "peerGroup.D", message: "High energy density / Unknown" });
    case "peer-group.E":
      return t({
        id: "peerGroup.E",
        message: "Low energy density / Medium settlement density",
      });
    case "peer-group.F":
      return t({
        id: "peerGroup.F",
        message: "Low energy density / Rural settlement density",
      });
    case "peer-group.G":
      return t({
        id: "peerGroup.G",
        message: "Low energy density / Mountain region",
      });
    case "peer-group.H":
      return t({ id: "peerGroup.H", message: "Low energy density / Tourism" });
    case "planned":
      return t({
        id: "typology.planned",
        message: "Planned",
      });
    case "unplanned":
      return t({
        id: "typology.unplanned",
        message: "Unplanned",
      });
    case "saidi":
      return t({
        id: "indicator.saidi",
        message: "Power Outage Duration (SAIDI)",
      });
    case "saifi":
      return t({
        id: "indicator.saifi",
        message: "Power Outage Frequency (SAIFI)",
      });
    case "networkCosts":
      return t({
        id: "indicator.networkCosts",
        message: "Network costs",
      });
    case "netTariffs":
      return t({
        id: "indicator.netTariffs",
        message: "Net tariffs",
      });
    case "energyTariffs":
      return t({
        id: "indicator.energyTariffs",
        message: "Energy tariffs",
      });
    case "serviceQuality":
      return t({
        id: "indicator.serviceQuality",
        message: "Service quality",
      });
    case "compliance":
      return t({
        id: "indicator.compliance",
        message: "Compliance",
      });
    case "peer-group.settlement-density.na":
      return t({
        id: "peer-group.settlement-density.na",
        message: `Not specified`,
      });
    case "peer-group.settlement-density.tourist":
      return t({
        id: "peer-group.settlement-density.tourist",
        message: `Tourism`,
      });
    case "peer-group.settlement-density.mountain":
      return t({
        id: "peer-group.settlement-density.mountain",
        message: `Mountain region`,
      });
    case "peer-group.settlement-density.unknown":
      return t({
        id: "peer-group.settlement-density.unknown",
        message: `Unknown`,
      });
    case "peer-group.settlement-density.medium":
      return t({
        id: "peer-group.settlement-density.medium",
        message: `Medium settlement density`,
      });
    case "peer-group.settlement-density.rural":
      return t({
        id: "peer-group.settlement-density.rural",
        message: `Rural settlement density`,
      });
    case "peer-group.energy-density.na":
      return t({
        id: "peer-group.energy-density.na",
        message: `Not specified`,
      });
    case "peer-group.energy-density.high":
      return t({
        id: "peer-group.energy-density.high",
        message: `High energy density`,
      });
    case "peer-group.energy-density.low":
      return t({
        id: "peer-group.energy-density.low",
        message: `Low energy density`,
      });

    case "network-level":
      return t({ id: "network-level", message: `Network level` });
    // NE (Not yet sure about translations)
    case "network-level.NE5.short":
      return t({ id: "network-level.NE5.short", message: `NE5` });
    case "network-level.NE5.long":
      return t({ id: "network-level.NE5.long", message: `High voltage NE5` });
    case "network-level.NE5.description":
      return t({
        id: "network-level.NE5.description",
        message: `At Network Level NE5`,
      });
    case "network-level.NE6.short":
      return t({ id: "network-level.NE6.short", message: `NE6` });
    case "network-level.NE6.description":
      return t({
        id: "network-level.NE6.description",
        message: `At Network Level NE6`,
      });
    case "network-level.NE6.long":
      return t({ id: "network-level.NE6.long", message: `Medium voltage NE6` });

    case "network-level.NE7.short":
      return t({ id: "network-level.NE7.short", message: `NE7` });
    case "network-level.NE7.description":
      return t({
        id: "network-level.NE7.description",
        message: `At Network Level NE7`,
      });
    case "network-level.NE7.long":
      return t({ id: "network-level.NE7.long", message: `Low voltage NE7` });

    case "sunshine.select-all":
      return t({
        id: "sunshine.select-all",
        message: `Select All`,
      });
    case "sunshine.costs-and-tariffs.selected-operators":
      return t({
        id: "sunshine.costs-and-tariffs.selected-operators",
        message: `Selected network operators`,
      });

    // ButtonGroup labels and content
    case "power-stability.view-by":
      return t({
        id: "sunshine.power-stability.view-by",
        message: "View By",
      });
    case "power-stability.latest-year-option":
      return t({
        id: "sunshine.power-stability.latest-year-option",
        message: "Latest year",
      });
    case "power-stability.latest-year-option-content":
      return t({
        id: "sunshine.power-stability.latest-year-option-content",
        message: "Lorem ipsum",
      });
    case "power-stability.progress-over-time":
      return t({
        id: "sunshine.power-stability.progress-over-time",
        message: "Progress over time",
      });
    case "power-stability.progress-over-time-content":
      return t({
        id: "sunshine.power-stability.progress-over-time-content",
        message: "Lorem ipsum",
      });
    case "power-stability.overall-option":
      return t({
        id: "sunshine.power-stability.overall-option",
        message: "Overall",
      });
    case "power-stability.overall-tooltip":
      return t({
        id: "sunshine.power-stability.overall-tooltip",
        message:
          "Shows the total outage duration per operator, combining planned and unplanned outages for direct comparison.",
      });
    case "power-stability.ratio-option":
      return t({
        id: "sunshine.power-stability.ratio-option",
        message: "Ratio",
      });
    case "power-stability.ratio-tooltip":
      return t({
        id: "sunshine.power-stability.ratio-tooltip",
        message:
          "Shows the ratio of unplanned outages to total outages, providing insight into the stability of the power supply.",
      });
    case "power-stability.duration":
      return t({
        id: "sunshine.power-stability.duration",
        message: "Duration",
      });
    case "power-stability.total-option":
      return t({
        id: "sunshine.power-stability.total-option",
        message: "Total",
      });
    case "power-stability.total-tooltip":
      return t({
        id: "sunshine.power-stability.total-tooltip",
        message:
          "Shows the total outage duration per operator, combining planned and unplanned outages for direct comparison.",
      });
    case "power-stability.planned-option":
      return t({
        id: "sunshine.power-stability.planned-option",
        message: "Planned",
      });
    case "power-stability.planned-tooltip":
      return t({
        id: "sunshine.power-stability.planned-tooltip",
        message:
          "Shows only planned outages, which are scheduled maintenance or upgrades.",
      });
    case "power-stability.unplanned-option":
      return t({
        id: "sunshine.power-stability.unplanned-option",
        message: "Unplanned",
      });
    case "power-stability.unplanned-tooltip":
      return t({
        id: "sunshine.power-stability.unplanned-tooltip",
        message:
          "Shows only unplanned outages, which are unexpected interruptions.",
      });

    case "costs-and-tariffs.view-by":
      return t({
        id: "sunshine.costs-and-tariffs.view-by",
        message: "View By",
      });
    case "costs-and-tariffs.latest-year-option":
      return t({
        id: "sunshine.costs-and-tariffs.latest-year-option",
        message: "Latest year",
      });
    case "costs-and-tariffs.progress-over-time":
      return t({
        id: "sunshine.costs-and-tariffs.progress-over-time",
        message: "Progress over time",
      });
    case "costs-and-tariffs.latest-year-option-content":
      return t({
        id: "sunshine.costs-and-tariffs.latest-year-option-content",
        message: "Lorem ipsum",
      });
    case "costs-and-tariffs.progress-over-time-content":
      return t({
        id: "sunshine.costs-and-tariffs.progress-over-time-content",
        message: "Lorem ipsum",
      });

    case "price-components.collapsed-content":
      return t({
        id: "selector.priceComponents.collapsed-content",
        message: "Lorem ipsum",
      });
    case "price-components.expanded-content":
      return t({
        id: "selector.priceComponents.expanded-content",
        message: "Lorem ipsum",
      });
    case "price-components.total-content":
      return t({
        id: "selector.priceComponents.total-content",
        message: "Lorem ipsum",
      });
    case "price-components.gridusage-content":
      return t({
        id: "selector.priceComponents.gridusage-content",
        message: "Lorem ipsum",
      });
    case "price-components.energy-content":
      return t({
        id: "selector.priceComponents.energy-content",
        message: "Lorem ipsum",
      });
    case "price-components.charge-content":
      return t({
        id: "selector.priceComponents.charge-content",
        message: "Lorem ipsum",
      });
    case "price-components.aidfee-content":
      return t({
        id: "selector.priceComponents.aidfee-content",
        message: "Lorem ipsum",
      });
    case "price-components.meteringrate-content":
      return t({
        id: "selector.priceComponents.meteringrate-content",
        message: "Lorem ipsum",
      });
    case "selector-tab.electricity":
      return t({
        id: "selector.tab.electricity",
        message: "Electricity Tariffs",
      });
    case "selector-tab.electricity-content":
      return t({
        id: "selector.tab.electricity-content",
        message: "Lorem ipsum",
      });
    case "selector-tab.indicators":
      return t({
        id: "selector.tab.indicators",
        message: "Indicators",
      });
    case "selector-tab.indicators-content":
      return t({
        id: "selector.tab.indicators-content",
        message: "Lorem ipsum",
      });

    default:
      return id;
  }
};

export const getPeerGroupLabels = function (peerGroup: PeerGroup) {
  const settlementDensityLabel = getLocalizedLabel({
    id: `peer-group.settlement-density.${
      peerGroup.settlementDensity?.toLowerCase() ?? "na"
    }`,
  });
  const energyDensityLabel = getLocalizedLabel({
    id: `peer-group.energy-density.${
      peerGroup.energyDensity?.toLowerCase() ?? "na"
    }`,
  });

  const peerGroupLabel = `${settlementDensityLabel} / ${energyDensityLabel}`;
  return {
    peerGroupLabel,
    settlementDensityLabel,
    energyDensityLabel,
  };
};

export const getNetworkLevelLabels = function (networkLevel: NetworkLevel) {
  return {
    short: getLocalizedLabel({ id: `network-level.${networkLevel.id}.short` }),
    long: getLocalizedLabel({ id: `network-level.${networkLevel.id}.long` }),
  };
};

export const getCategoryLabels = function (category: ElectricityCategory) {
  return {
    short: getLocalizedLabel({ id: `${category}` }),
    long: getLocalizedLabel({ id: `${category}-long` }),
  };
};
