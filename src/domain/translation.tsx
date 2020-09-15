import { I18n } from "@lingui/core";
import { t } from "@lingui/macro";

export const getLocalizedLabel = ({
  i18n,
  id,
}: {
  i18n: I18n;
  id: string;
}): string => {
  switch (id) {
    case "standard":
      return i18n._(t("selector.product.standard")`Standard`);
    case "cheapest":
      return i18n._(t("selector.product.cheapest")`Günstigstes`);
    case "gridusage":
      return i18n._(t("selector.pricecomponent.gridusage")`Netznutzung`);
    case "energy":
      return i18n._(t("selector.pricecomponent.energy")`Energie`);
    case "charge":
      return i18n._(
        t("selector.pricecomponent.charge")`Abgaben an das Gemeinwesen`
      );
    case "aidfee":
      return i18n._(t("selector.pricecomponent.aidfee")`Förderabgaben (KEV)`);
    case "total":
      return i18n._(t("selector.pricecomponent.total")`Total`);

    case "H1":
      return i18n._(t("selector.category.H1")`H1`);
    case "H2":
      return i18n._(t("selector.category.H2")`H2`);
    case "H3":
      return i18n._(t("selector.category.H3")`H3`);
    case "H4":
      return i18n._(t("selector.category.H4")`H4`);
    case "H5":
      return i18n._(t("selector.category.H5")`H5`);
    case "H6":
      return i18n._(t("selector.category.H6")`H6`);
    case "H7":
      return i18n._(t("selector.category.H7")`H7`);
    case "H8":
      return i18n._(t("selector.category.H8")`H8`);
    case "C1":
      return i18n._(t("selector.category.C1")`C1`);
    case "C2":
      return i18n._(t("selector.category.C2")`C2`);
    case "C3":
      return i18n._(t("selector.category.C3")`C3`);
    case "C4":
      return i18n._(t("selector.category.C4")`C4`);
    case "C5":
      return i18n._(t("selector.category.C5")`C5`);
    case "C6":
      return i18n._(t("selector.category.C6")`C6`);
    case "C7":
      return i18n._(t("selector.category.C7")`C7`);
    case "period":
      return i18n._(t("filters.year")`Jahr`);
    case "category":
      return i18n._(t("filters.category")`Kategorie`);
    case "product":
      return i18n._(t("filters.product")`Produkt`);
    case "priceComponent":
      return i18n._(t("filters.price.component")`Preiskomponente`);
    case "OperatorResult":
    case "operator":
      return i18n._(t("search.result.operator")`Netzbetreiber`);
    case "operators":
      return i18n._(t("chart.annotation.operators")`Netzbetreiber`);
    case "MunicipalityResult":
    case "municipality":
      return i18n._(t("search.result.municipality")`Gemeinde`);
    case "municipalities":
      return i18n._(t("chart.annotation.municipalities")`Gemeinden`);
    case "CantonResult":
    case "canton":
      return i18n._(t("search.result.canton")`Kanton`);

    default:
      return id;
  }
};
