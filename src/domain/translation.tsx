import { t } from "@lingui/macro";

import { NetworkLevel, PeerGroup } from "src/domain/data";

export const getLocalizedLabel = ({ id }: { id: string }): string => {
  switch (id) {
    case "collapsed-operator":
      return t({
        id: "priceComponents.view.collapsed.municipalities",
        message: `Gemeinden gruppieren`,
      });
    case "expanded-operator":
      return t({
        id: "priceComponents.view.expanded.municipalities",
        message: `Einzelne Gemeinden anzeigen`,
      });
    case "collapsed-municipality":
      return t({
        id: "priceComponents.view.collapsed.operators",
        message: `Netzbetreiber gruppieren`,
      });
    case "expanded-municipality":
      return t({
        id: "priceComponents.view.expanded.operators",
        message: `Einzelne Netzbetreiber anzeigen`,
      });
    case "unit":
      return t({ id: "chart.axis.unit.Rp/kWh", message: `Rp./kWh` });
    case "standard":
      return t({ id: "selector.product.standard", message: `Standard` });
    case "cheapest":
      return t({ id: "selector.product.cheapest", message: `Günstigstes` });
    case "gridusage":
      return t({
        id: "selector.pricecomponent.gridusage",
        message: `Netznutzung`,
      });
    case "energy":
      return t({ id: "selector.pricecomponent.energy", message: `Energie` });
    case "charge":
      return t({
        id: "selector.pricecomponent.charge",
        message: `Abgaben an das Gemeinwesen`,
      });
    case "aidfee":
      return t({
        id: "selector.pricecomponent.aidfee",
        message: `Netzzuschlag gem. Art. 35 EnG`,
      });
    case "total":
      return t({ id: "selector.pricecomponent.total", message: `Total` });

    case "H1":
      return t({ id: "selector.category.H1", message: `H1` });
    case "H2":
      return t({ id: "selector.category.H2", message: `H2` });
    case "H3":
      return t({ id: "selector.category.H3", message: `H3` });
    case "H4":
      return t({ id: "selector.category.H4", message: `H4` });
    case "H5":
      return t({ id: "selector.category.H5", message: `H5` });
    case "H6":
      return t({ id: "selector.category.H6", message: `H6` });
    case "H7":
      return t({ id: "selector.category.H7", message: `H7` });
    case "H8":
      return t({ id: "selector.category.H8", message: `H8` });
    case "C1":
      return t({ id: "selector.category.C1", message: `C1` });
    case "C2":
      return t({ id: "selector.category.C2", message: `C2` });
    case "C3":
      return t({ id: "selector.category.C3", message: `C3` });
    case "C4":
      return t({ id: "selector.category.C4", message: `C4` });
    case "C5":
      return t({ id: "selector.category.C5", message: `C5` });
    case "C6":
      return t({ id: "selector.category.C6", message: `C6` });
    case "C7":
      return t({ id: "selector.category.C7", message: `C7` });
    case "H-group":
      return t({ id: "selector.category.H-group", message: `Haushalte` });
    case "C-group":
      return t({
        id: "selector.category.C-group",
        message: `Gewerbe- und Industriebetrieben`,
      });
    case "period":
      return t({ id: "filters.year", message: `Jahr` });
    case "category":
      return t({ id: "filters.category", message: `Kategorie` });
    case "product":
      return t({ id: "filters.product", message: `Produkt` });
    case "priceComponent":
      return t({ id: "filters.price.component", message: `Preiskomponente` });
    case "OperatorResult":
    case "operator":
      return t({ id: "search.result.operator", message: `Netzbetreiber` });
    case "operators":
      return t({ id: "chart.annotation.operators", message: `Netzbetreiber` });
    case "MunicipalityResult":
    case "municipality":
      return t({ id: "search.result.municipality", message: `Gemeinde` });
    case "municipalities":
      return t({ id: "chart.annotation.municipalities", message: `Gemeinden` });
    case "CantonResult":
    case "canton":
      return t({ id: "search.result.canton", message: `Kanton` });
    case "cantons":
      return t({ id: "chart.annotation.cantons", message: `Kantone` });
    case "median-asc":
      return t({
        id: "rangeplot.select.sorting.median-asc",
        message: `Median aufsteigend`,
      });
    case "median-desc":
      return t({
        id: "rangeplot.select.sorting.median-desc",
        message: `Median absteigend`,
      });
    case "alpha-asc":
      return t({
        id: "rangeplot.select.sorting.alpha-asc",
        message: `Alphabetisch aufsteigend`,
      });
    case "alpha-desc":
      return t({
        id: "rangeplot.select.sorting.alpha-desc",
        message: `Alphabetisch absteigend`,
      });

    case "peer-group.settlement-density.na":
      return t({
        id: "peer-group.settlement-density.na",
        message: `Keine Angabe`,
      });
    case "peer-group.settlement-density.tourist":
      return t({
        id: "peer-group.settlement-density.tourist",
        message: `Tourismus`,
      });
    case "peer-group.settlement-density.mountain":
      return t({
        id: "peer-group.settlement-density.mountain",
        message: `Berggebiet`,
      });
    case "peer-group.settlement-density.unknown":
      return t({
        id: "peer-group.settlement-density.unknown",
        message: `Unbekannt`,
      });
    case "peer-group.settlement-density.medium":
      return t({
        id: "peer-group.settlement-density.medium",
        message: `Mittlere Siedlungsdichte`,
      });
    case "peer-group.settlement-density.rural":
      return t({
        id: "peer-group.settlement-density.rural",
        message: `Ländliche Siedlungsdichte`,
      });
    case "peer-group.energy-density.na":
      return t({
        id: "peer-group.energy-density.na",
        message: `Keine Angabe`,
      });
    case "peer-group.energy-density.high":
      return t({
        id: "peer-group.energy-density.high",
        message: `Hohe Energiedichte`,
      });
    case "peer-group.energy-density.low":
      return t({
        id: "peer-group.energy-density.low",
        message: `Niedrige Energiedichte`,
      });

    // NL (Not yet sure about translations)
    case "network-level.NL5.short":
      return t({ id: "network-level.NL5.short", message: `NL5` });
    case "network-level.NL5.long":
      return t({ id: "network-level.NL5.long", message: `Hochspannung` });
    case "network-level.NL6.short":
      return t({ id: "network-level.NL6.short", message: `NL6` });
    case "network-level.NL6.long":
      return t({ id: "network-level.NL6.long", message: `Mittelspannung` });
    case "network-level.NL7.short":
      return t({ id: "network-level.NL7.short", message: `NL7` });

    // NE (Not yet sure about translations)
    case "network-level.NE5.short":
      return t({ id: "network-level.NE5.short", message: `NE5` });
    case "network-level.NE5.long":
      return t({ id: "network-level.NE5.long", message: `Hochspannung` });
    case "network-level.NE7.short":
      return t({ id: "network-level.NE7.short", message: `NE7` });
    case "network-level.NE7.long":
      return t({ id: "network-level.NE7.long", message: `Niederspannung` });

    case "sunshine.costs-and-tariffs.all-peer-group":
      return t({
        id: "sunshine.costs-and-tariffs.all-peer-group",
        message: `Alle Peer-Group-Netzbetreiber`,
      });
    case "sunshine.costs-and-tariffs.selected-operators":
      return t({
        id: "sunshine.costs-and-tariffs.selected-operators",
        message: `Ausgewählte Netzbetreiber`,
      });

    default:
      return id;
  }
};

export const getPeerGroupLabels = function (peerGroup: PeerGroup) {
  const settlementDensityLabel = getLocalizedLabel({
    id: `peer-group.settlement-density.${peerGroup.settlementDensity}`,
  });
  const energyDensityLabel = getLocalizedLabel({
    id: `peer-group.energy-density.${peerGroup.energyDensity}`,
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
