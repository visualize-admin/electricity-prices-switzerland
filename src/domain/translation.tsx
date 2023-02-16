import { useTranslation, i18n } from "next-i18next";

export const getLocalizedLabel = ({ id }: { id: string }): string => {
  if (!i18n) {
    return "";
  }
  const t = i18n.t;
  switch (id) {
    case "collapsed-operator":
      return t(
        "priceComponents.view.collapsed.municipalities",
        `Gemeinden gruppieren`
      );
    case "expanded-operator":
      return t(
        "priceComponents.view.expanded.municipalities",
        `Einzelne Gemeinden anzeigen`
      );
    case "collapsed-municipality":
      return t(
        "priceComponents.view.collapsed.operators",
        `Netzbetreiber gruppieren`
      );
    case "expanded-municipality":
      return t(
        "priceComponents.view.expanded.operators",
        `Einzelne Netzbetreiber anzeigen`
      );
    case "unit":
      return t("chart.axis.unit.Rp/kWh", `Rp./kWh`);
    case "standard":
      return t("selector.product.standard", `Standard`);
    case "cheapest":
      return t("selector.product.cheapest", `Günstigstes`);
    case "gridusage":
      return t("selector.pricecomponent.gridusage", `Netznutzung`);
    case "energy":
      return t("selector.pricecomponent.energy", `Energie`);
    case "charge":
      return t("selector.pricecomponent.charge", `Abgaben an das Gemeinwesen`);
    case "aidfee":
      return t(
        "selector.pricecomponent.aidfee",
        `Netzzuschlag gem. Art. 35 EnG`
      );
    case "total":
      return t("selector.pricecomponent.total", `Total`);

    case "H1":
      return t("selector.category.H1", `H1`);
    case "H2":
      return t("selector.category.H2", `H2`);
    case "H3":
      return t("selector.category.H3", `H3`);
    case "H4":
      return t("selector.category.H4", `H4`);
    case "H5":
      return t("selector.category.H5", `H5`);
    case "H6":
      return t("selector.category.H6", `H6`);
    case "H7":
      return t("selector.category.H7", `H7`);
    case "H8":
      return t("selector.category.H8", `H8`);
    case "C1":
      return t("selector.category.C1", `C1`);
    case "C2":
      return t("selector.category.C2", `C2`);
    case "C3":
      return t("selector.category.C3", `C3`);
    case "C4":
      return t("selector.category.C4", `C4`);
    case "C5":
      return t("selector.category.C5", `C5`);
    case "C6":
      return t("selector.category.C6", `C6`);
    case "C7":
      return t("selector.category.C7", `C7`);
    case "H-group":
      return t("selector.category.H-group", `Haushalte`);
    case "C-group":
      return t("selector.category.C-group", `Gewerbe- und Industriebetrieben`);
    case "period":
      return t("filters.year", `Jahr`);
    case "category":
      return t("filters.category", `Kategorie`);
    case "product":
      return t("filters.product", `Produkt`);
    case "priceComponent":
      return t("filters.price.component", `Preiskomponente`);
    case "OperatorResult":
    case "operator":
      return t("search.result.operator", `Netzbetreiber`);
    case "operators":
      return t("chart.annotation.operators", `Netzbetreiber`);
    case "MunicipalityResult":
    case "municipality":
      return t("search.result.municipality", `Gemeinde`);
    case "municipalities":
      return t("chart.annotation.municipalities", `Gemeinden`);
    case "CantonResult":
    case "canton":
      return t("search.result.canton", `Kanton`);
    case "median-asc":
      return t("rangeplot.select.sorting.median-asc", `Median aufsteigend`);
    case "median-desc":
      return t("rangeplot.select.sorting.median-desc", `Median absteigend`);
    case "alpha-asc":
      return t(
        "rangeplot.select.sorting.alpha-asc",
        `Alphabetisch aufsteigend`
      );
    case "alpha-desc":
      return t(
        "rangeplot.select.sorting.alpha-desc",
        `Alphabetisch absteigend`
      );
    default:
      return id;
  }
};
