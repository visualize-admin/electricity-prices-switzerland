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
              "ElCom, Switzerland's independent electricity regulator, oversees compliance with the Federal Electricity and Energy Acts. It monitors electricity prices, supply security, and international trading, and resolves disputes on network access, feed-in tariffs, and between operators and producers.",
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
        <Link
          href={t({
            id: "footer.energy_saving.link",
            message: "https://www.elcom.admin.ch/energy-saving",
          })}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.energy_saving",
              message: "Energy saving",
            })}
          />
        </Link>
        <Link
          href={t({
            id: "footer.supply_situation.link",
            message: "https://www.elcom.admin.ch/supply-situation",
          })}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.supply_situation",
              message: "Supply situation",
            })}
          />
        </Link>
        <FooterSectionButton
          iconName="arrow-right"
          onClick={() => helpCalculationDisclosure.open()}
          label={t({
            id: "footer.basis-of-calculation",
            message: "Basis of calculation",
          })}
        />
      </FooterSection>

      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.download-visualize-data",
            message: "Download data",
          })}
        />
        <FooterSectionButton
          iconName="download"
          onClick={() => helpCsvDisclosure.open()}
          label={t({
            id: "footer.data-as-csv",
            message: "Data as csv",
          })}
        />
        <Link
          href={t({
            id: "footer.data-on-opendata-swiss.link",
            message:
              "https://opendata.swiss/de/organization/bundesamt-fur-energie-bfe?q=energiedashboard",
          })}
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
          href={t({
            id: "footer.create-data-visualizations.link",
            message:
              "https://www.elcom.admin.ch/elcom/de/home/themen/strompreise/tarif-rohdaten-verteilnetzbetreiber.html",
          })}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.create-data-visualizations",
              message: "Create data visualisations with ElCom dataset",
            })}
          />
        </Link>
      </FooterSection>
    </SwissFederalCiFooter>
  );
};
