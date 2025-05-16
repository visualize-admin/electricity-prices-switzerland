import {
  FooterSection,
  FooterSectionButton,
  FooterSectionText,
  FooterSectionTitle,
  Footer as SwissFederalCiFooter,
} from "@interactivethings/swiss-federal-ci/dist/components";
import { t } from "@lingui/macro";
import { Link, SxProps } from "@mui/material";

import { useDisclosure } from "./use-disclosure";

export const Footer = ({ sx }: { sx?: SxProps }) => {
  const helpCalculationDisclosure = useDisclosure();
  const helpCsvDisclosure = useDisclosure();

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
        <Link
          href={"https://www.elcom.admin.ch/energy-saving"}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.energy_saving",
              message: "Energie sparen",
            })}
          />
        </Link>
        <Link
          href={"https://www.elcom.admin.ch/supply-situation"}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.supply_situation",
              message: "Versorgungslage",
            })}
          />
        </Link>
        <FooterSectionButton
          iconName="arrow-right"
          onClick={() => helpCalculationDisclosure.open()}
          label={t({
            id: "footer.basis-of-calculation",
            message: "Grundlage der Berechnung",
          })}
        />
      </FooterSection>

      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.download-visualize-data",
            message: "Daten herunterladen",
          })}
        />
        <FooterSectionButton
          iconName="download"
          onClick={() => helpCsvDisclosure.open()}
          label={t({
            id: "footer.data-as-csv",
            message: "Daten als csv",
          })}
        />
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
