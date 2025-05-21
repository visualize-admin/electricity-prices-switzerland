import {
  FooterSection,
  FooterSectionButton,
  FooterSectionText,
  FooterSectionTitle,
  Footer as SwissFederalCiFooter,
} from "@interactivethings/swiss-federal-ci/dist/components";
import { t } from "@lingui/macro";
import { Link, SxProps } from "@mui/material";

import { useLocale } from "src/lib/use-locale";
import { useQueryStateSingle } from "src/lib/use-query-state";

import { useDisclosure } from "./use-disclosure";

export const Footer = ({ sx }: { sx?: SxProps }) => {
  const locale = useLocale();
  const [{ period }] = useQueryStateSingle();
  const helpCalculationDisclosure = useDisclosure();
  const helpCsvDisclosure = useDisclosure();
  const helpMunicipalitiesInfoDisclosure = useDisclosure();

  const bottomLinks = [
    {
      title: t({ id: "footer.legal-framework", message: "Rechtliches" }),
      href: t({
        id: "footer.legal-framework.link",
        message: "https://www.admin.ch/gov/de/start/rechtliches.html",
      }),
      external: true,
    },
  ];

  return (
    <SwissFederalCiFooter
      ContentWrapperProps={{ sx: sx ?? undefined }}
      bottomLinks={bottomLinks}
      nCols={3}
    >
      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.about_us.label",
            message: "About us",
          })}
        />
        <FooterSectionText
          text={t({
            id: "footer.about_us.text",
            message:
              "Die ElCom, der unabhängige Stromregulator der Schweiz, überwacht die Einhaltung des Elektrizitäts- und des Energiegesetzes. Sie überwacht die Strompreise, die Versorgungssicherheit und den internationalen Handel und schlichtet Streitigkeiten beim Netzzugang, bei den Einspeisevergütungen sowie zwischen Betreibern und Produzenten.",
          })}
        />
      </FooterSection>

      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.more-information",
            message: "Weitere Informationen",
          })}
        />
        <FooterSectionButton
          iconName="arrow-right"
          onClick={() => helpCalculationDisclosure.open()}
          label={t({
            id: "footer.basis-of-calculation",
            message: "Berechnungsgrundlagen",
          })}
        />
        <Link
          href={
            "https://www.elcom.admin.ch/elcom/de/home/themen/strompreise.html"
          }
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.additional-information",
              message: "Weitere Informationen zu den Tarifen in der Schweiz",
            })}
          />
        </Link>
        <Link
          href={
            "https://www.swissgrid.ch/dam/swissgrid/customers/topics/tariffs/Tabelle-Tarife-de.pdf"
          }
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.tariff-components",
              message: "Tarifkomponenten Übertragungsnetz - Swissgrid",
            })}
          />
        </Link>
      </FooterSection>

      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.download-visualize-data",
            message: "Daten herunterladen",
          })}
        />
        <Link href={`/api/data-export?period=${period}&locale=${locale}`}>
          <FooterSectionButton
            iconName="download"
            onClick={() => helpCsvDisclosure.open()}
            label={t({
              id: "footer.data-as-csv",
              message: "Daten als csv",
            })}
          />
        </Link>

        <Link href={`/api/municipalities-data.csv?period=${period}`}>
          <FooterSectionButton
            iconName="download"
            onClick={() => helpMunicipalitiesInfoDisclosure.open()}
            label={t({
              id: "footer.swiss-municipalities-grid",
              message:
                "Schweizerische Gemeinden und zuständige Stromnetzbetreiber",
            })}
          />
        </Link>

        <Link
          href={
            "https://opendata.swiss/organization/bundesamt-fur-energie-bfe?q=energiedashboard"
          }
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.data-on-opendata-swiss",
              message: "Daten auf opendata.swiss",
            })}
          />
        </Link>
        <Link
          href={
            "https://www.elcom.admin.ch/elcom/home/themen/strompreise/tarif-rohdaten-verteilnetzbetreiber.html"
          }
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.create-data-visualizations",
              message: "Datenvisualisierungen mit ElCom-Datensatz erstellen",
            })}
          />
        </Link>
      </FooterSection>
    </SwissFederalCiFooter>
  );
};
