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
import { useQueryStateEnergyPricesMap } from "src/domain/query-states";

import { HelpDialog } from "./info-dialog";
import { useDisclosure } from "./use-disclosure";

export const Footer = ({ sx }: { sx?: SxProps }) => {
  const locale = useLocale();
  const [{ period }] = useQueryStateEnergyPricesMap();
  const helpCalculationDisclosure = useDisclosure();
  const helpCsvDisclosure = useDisclosure();
  const helpMunicipalitiesInfoDisclosure = useDisclosure();

  const bottomLinks = [
    {
      title: t({ id: "footer.legal-framework", message: "Legal matters" }),
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
              "ElCom, Switzerland's independent electricity regulator, monitors compliance with the Electricity Act and the Energy Act. It monitors electricity prices, security of supply and international trade and settles disputes regarding grid access, feed-in tariffs and between operators and producers.",
          })}
        />
      </FooterSection>
      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.more-information",
            message: "Further information",
          })}
        />
        <HelpDialog
          close={helpCalculationDisclosure.close}
          label={t({
            id: "help.calculation",
            message: "Calculation basis",
          })}
          open={helpCalculationDisclosure.isOpen}
          slug="help-calculation"
        />
        <FooterSectionButton
          iconName="arrow-right"
          onClick={() => helpCalculationDisclosure.open()}
          label={t({
            id: "footer.basis-of-calculation",
            message: "Basis of calculation",
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
              message: "Further information on tariffs in Switzerland",
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
              message: "Transmission grid tariff components - Swissgrid",
            })}
          />
        </Link>
      </FooterSection>
      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.download-visualize-data",
            message: "Download data",
          })}
        />
        <Link href={`/api/data-export?period=${period}&locale=${locale}`}>
          <FooterSectionButton
            iconName="download"
            onClick={() => helpCsvDisclosure.open()}
            label={t({
              id: "footer.data-as-csv",
              message: "Data as csv",
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
                "Swiss municipalities and responsible electricity grid operators",
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
              message: "Data on opendata.swiss",
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
              message: "Create data visualizations with ElCom data set",
            })}
          />
        </Link>
      </FooterSection>
    </SwissFederalCiFooter>
  );
};
