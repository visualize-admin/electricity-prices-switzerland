import { Trans } from "@lingui/macro";

import * as React from "react";

export const getLocalizedLabel = (id: string): string | React.ReactNode => {
  switch (id) {
    case "2021":
      return <Trans id="selector.year.2021">2021</Trans>;
    case "2020":
      return <Trans id="selector.year.2020">2020</Trans>;
    case "2019":
      return <Trans id="selector.year.2019">2019</Trans>;
    case "2018":
      return <Trans id="selector.year.2018">2018</Trans>;
    case "2017":
      return <Trans id="selector.year.2017">2017</Trans>;
    case "2016":
      return <Trans id="selector.year.2016">2016</Trans>;
    case "2015":
      return <Trans id="selector.year.2015">2015</Trans>;
    case "2014":
      return <Trans id="selector.year.2014">2014</Trans>;
    case "2013":
      return <Trans id="selector.year.2013">2013</Trans>;
    case "2012":
      return <Trans id="selector.year.2012">2012</Trans>;
    case "2011":
      return <Trans id="selector.year.2011">2011</Trans>;
    case "2010":
      return <Trans id="selector.year.2010">2010</Trans>;
    case "2009":
      return <Trans id="selector.year.2009">2009</Trans>;
    case "standard":
      return <Trans id="selector.product.standard">Standard</Trans>;
    case "economic":
      return <Trans id="selector.product.economic">Günstig</Trans>;
    case "gridusage":
      return <Trans id="selector.pricecomponent.gridusage">Netznutzung</Trans>;
    case "energy":
      return <Trans id="selector.pricecomponent.energy">Energie</Trans>;
    case "charge":
      return (
        <Trans id="selector.pricecomponent.charge">
          Abgaben an das Gemeinwesen
        </Trans>
      );
    case "aidfee":
      return (
        <Trans id="selector.pricecomponent.aidfee">Förderabgaben (KEV)</Trans>
      );
    case "total":
      return <Trans id="selector.pricecomponent.total">Total</Trans>;

    case "H1":
      return <Trans id="selector.category.H1">H1</Trans>;
    case "H2":
      return <Trans id="selector.category.H2">H2</Trans>;
    case "H3":
      return <Trans id="selector.category.H3">H3</Trans>;
    case "H4":
      return <Trans id="selector.category.H4">H4</Trans>;
    case "H5":
      return <Trans id="selector.category.H5">H5</Trans>;
    case "H6":
      return <Trans id="selector.category.H6">H6</Trans>;
    case "H7":
      return <Trans id="selector.category.H7">H7</Trans>;
    case "H8":
      return <Trans id="selector.category.H8">H8</Trans>;
    case "C1":
      return <Trans id="selector.category.C1">C1</Trans>;
    case "C2":
      return <Trans id="selector.category.C2">C2</Trans>;
    case "C3":
      return <Trans id="selector.category.C3">C3</Trans>;
    case "C4":
      return <Trans id="selector.category.C4">C4</Trans>;
    case "C5":
      return <Trans id="selector.category.C5">C5</Trans>;
    case "C6":
      return <Trans id="selector.category.C6">C6</Trans>;
    case "C7":
      return <Trans id="selector.category.C7">C7</Trans>;

    default:
      return id;
  }
};
