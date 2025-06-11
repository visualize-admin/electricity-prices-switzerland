import { t } from "@lingui/macro";

import { TariffCategory, NetworkLevel, PeerGroup } from "src/domain/data";

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
    case "unit":
      return t({ id: "chart.axis.unit.Rp/kWh", message: "Rp./kWh" });
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
        message: `H1 - 2-Zimmerwohnung mit Elektroherd`,
      });
    case "H2-long":
      return t({
        id: "selector.category.H2-long",
        message: `H2 - 4-Zimmerwohnung mit Elektroherd`,
      });
    case "H3-long":
      return t({
        id: "selector.category.H3-long",
        message: `H3 - 4-Zimmerwohnung mit Elektroherd und Elektroboiler`,
      });
    case "H4-long":
      return t({
        id: "selector.category.H4-long",
        message: `H4 - 5-Zimmerwohnung mit Elektroherd und Tumbler`,
      });
    case "H5-long":
      return t({
        id: "selector.category.H5-long",
        message: `H5 - 5-Zimmer-Einfamilienhaus mit Elektroherd, Elektroboiler und Tumbler`,
      });
    case "H6-long":
      return t({
        id: "selector.category.H6-long",
        message: `H6 - 5-Zimmer-Einfamilienhaus mit elektrischer Widerstandsheizung`,
      });
    case "H7-long":
      return t({
        id: "selector.category.H7-long",
        message: `H7 - 5-Zimmer-Einfamilienhaus mit Wärmepumpe zur Beheizung`,
      });
    case "H8-long":
      return t({
        id: "selector.category.H8-long",
        message: `H8 - Grosse, hoch elektrifizierte Eigentumswohnung`,
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

    // NL (Not yet sure about translations)
    case "network-level.NL5.short":
      return t({ id: "network-level.NL5.short", message: `NL5` });
    case "network-level.NL5.long":
      return t({ id: "network-level.NL5.long", message: `High voltage NL5` });

    case "network-level.NL6.short":
      return t({ id: "network-level.NL6.short", message: `NL6` });
    case "network-level.NL6.long":
      return t({ id: "network-level.NL6.long", message: `Medium voltage NL6` });

    case "network-level.NL7.short":
      return t({ id: "network-level.NL7.short", message: `NL7` });
    case "network-level.NL7.long":
      return t({ id: "network-level.NL7.long", message: `Low voltage NL7` });

    // NE (Not yet sure about translations)
    case "network-level.NE5.short":
      return t({ id: "network-level.NE5.short", message: `NE5` });
    case "network-level.NE5.long":
      return t({ id: "network-level.NE5.long", message: `High voltage NE5` });

    case "network-level.NE7.short":
      return t({ id: "network-level.NE7.short", message: `NE7` });
    case "network-level.NE7.long":
      return t({ id: "network-level.NE7.long", message: `Low voltage NE7` });

    case "sunshine.costs-and-tariffs.all-peer-group":
      return t({
        id: "sunshine.costs-and-tariffs.all-peer-group",
        message: `All peer group network operators`,
      });
    case "sunshine.costs-and-tariffs.selected-operators":
      return t({
        id: "sunshine.costs-and-tariffs.selected-operators",
        message: `Selected network operators`,
      });

    default:
      return id;
  }
};

export const getPeerGroupLabels = function (peerGroup: PeerGroup) {
  const settlementDensityLabel = getLocalizedLabel({
    id: `peer-group.settlement-density.${peerGroup.settlementDensity.toLowerCase()}`,
  });
  const energyDensityLabel = getLocalizedLabel({
    id: `peer-group.energy-density.${peerGroup.energyDensity.toLowerCase()}`,
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

export const getCategoryLabels = function (category: TariffCategory) {
  return {
    short: getLocalizedLabel({ id: `${category}` }),
    long: getLocalizedLabel({ id: `${category}-long` }),
  };
};
