import { Trans, t } from "@lingui/macro";
import { Box, Flex, Link, Text } from "@theme-ui/components";
import { forwardRef, PropsWithChildren, ReactNode } from "react";
import { Icon } from "../icons";
import { useLocale } from "../lib/use-locale";
import { useQueryStateSingle } from "../lib/use-query-state";

import { HelpDialog, InfoDialogButton } from "./info-dialog";
import { LogoDesktop } from "./logo";
import { IconCaretDown } from "../icons/ic-caret-down";
import { IconShare } from "../icons/ic-share";
import { BoxProps, IconButton, LinkProps } from "theme-ui";
import { IconDownload } from "../icons/ic-download";
import { useDisclosure } from "./useDisclosure";
import { IconInfo } from "../icons/ic-info";

const FooterLink = ({
  children,
  icon,
  ...props
}: PropsWithChildren<
  {
    icon?: React.ReactNode;
  } & LinkProps
>) => {
  return (
    <Link
      {...props}
      variant="inline"
      sx={{
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
        p: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...props.sx,
      }}
    >
      <div>{children}</div>
      {icon}
    </Link>
  );
};

const FooterTitle = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Text variant="heading2" sx={{ mb: 6 }}>
      {children}
    </Text>
  );
};
const FooterSection = ({ children }: PropsWithChildren<{}>) => {
  return <Box>{children}</Box>;
};

export const Footer = () => {
  const locale = useLocale();
  const [{ period }] = useQueryStateSingle();

  const {
    isOpen: isHelpCalculationOpen,
    open: openHelpCalculation,
    close: closeHelpCalculation,
  } = useDisclosure();

  const {
    isOpen: isHelpCsvDownloadOpen,
    open: openHelpCsvDownload,
    close: closeHelpCsvDownload,
  } = useDisclosure();

  const handleOpenCalculation = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    openHelpCalculation();
  };

  const handleOpenCsvDownload = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    openHelpCsvDownload();
  };

  return (
    <Box
      sx={{
        bg: "monochrome200",
        borderTop: "1px solid",
        borderColor: "monochrome500",
        paddingTop: 6,
      }}
    >
      <Box
        sx={{
          display: "grid",
          p: 6,
          marginBottom: 8,
          gap: 6,
          gridTemplateColumns: ["1fr", "1fr 1fr"],
        }}
      >
        <FooterSection>
          <FooterTitle>
            {t({
              id: "footer.more-information",
              message: `Weiterführende Informationen`,
            })}
          </FooterTitle>
          <FooterLink
            sx={{ cursor: "pointer" }}
            onClick={handleOpenCalculation}
            href="#"
            icon={<IconInfo />}
          >
            {t({
              id: "footer.calculation-basics",
              message: `Berechnungsgrundlagen`,
            })}
          </FooterLink>
          <HelpDialog
            close={closeHelpCalculation}
            label={t({
              id: "help.calculation",
              message: `Berechnungsgrundlage`,
            })}
            open={isHelpCalculationOpen}
            slug="help-calculation"
          />
          <HelpDialog
            close={closeHelpCsvDownload}
            label={t({
              id: "help.csv-download",
              message: `Daten als .csv`,
            })}
            open={isHelpCsvDownloadOpen}
            slug="help-download-raw-data"
          />
          <FooterLink
            target="_blank"
            href={t({
              id: "footer.more-tariffs-information.link",
              message:
                "https://www.elcom.admin.ch/elcom/de/home/themen/strompreise.html",
            })}
            icon={<IconShare />}
          >
            {t({
              id: "footer.more-tariffs-information",
              message: "Weitere Informationen zu den Tarifen in der Schweiz",
            })}
          </FooterLink>

          <FooterLink
            target="_blank"
            href={t({
              id: "footer.transmission-grid-tariff.link",
              message:
                "https://www.swissgrid.ch/dam/swissgrid/customers/topics/tariffs/Tabelle-Tarife-de.pdf",
            })}
            icon={<IconShare />}
          >
            {t({
              id: "footer.transmission-grid-tariff",
              message: "Tarifkomponenten Übertragungsnetz - Swissgrid",
            })}
          </FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>
            {t({
              id: "footer.download-visualize-data",
              message: "Daten herunterladen / visualisieren",
            })}
          </FooterTitle>
          <FooterLink
            href={`/api/data-export?period=${period}&locale=${locale}`}
            icon={
              <Box sx={{ display: "flex", flexShrink: 0, gap: "1rem" }}>
                <IconButton
                  sx={{ p: 0, width: 24, height: 24, cursor: "pointer" }}
                  onClick={handleOpenCsvDownload}
                >
                  <IconInfo />
                </IconButton>
                <IconDownload />
              </Box>
            }
          >
            {t({ id: "footer.data-as-csv", message: "Daten als .csv" })}
          </FooterLink>
          <FooterLink
            target="_blank"
            icon={<IconShare />}
            href={t({
              id: "footer.data-on-opendata-swiss.link",
              message:
                "https://opendata.swiss/de/organization/bundesamt-fur-energie-bfe?q=energiedashboard",
            })}
          >
            {t({
              id: "footer.data-on-opendata-swiss",
              message: "Daten auf opendata.swiss",
            })}
          </FooterLink>
          <FooterLink
            icon={<IconShare />}
            target="_blank"
            href={t({
              id: "footer.create-data-visualizations.link",
              message:
                "https://www.elcom.admin.ch/elcom/de/home/themen/strompreise/tarif-rohdaten-verteilnetzbetreiber.html",
            })}
          >
            {t({
              id: "footer.create-data-visualizations",
              message: "Datenvisualierungen mit den ElCom-Daten erstellen",
            })}
          </FooterLink>
        </FooterSection>
      </Box>

      <Flex
        as="footer"
        sx={{
          flexDirection: ["column", "row"],
          justifyContent: ["flex-start", "space-between"],
          alignItems: ["flex-start", "center"],
          bg: "monochrome200",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome500",
        }}
      >
        <Box
          sx={{
            width: "100%",
            px: 6,
            py: 5,
            color: ["monochrome900", "monochrome700"],
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Text variant="paragraph2">
            <Trans id="footer.institution.name">
              Eidgenössische Elektrizitätskommission ElCom
            </Trans>
          </Text>
          <Text variant="paragraph2" sx={{ display: "block" }} as="div">
            <Link
              target="_blank"
              variant="inline"
              href={t({
                id: "footer.legal-framework.link",
                message: "https://www.admin.ch/gov/de/start/rechtliches.html",
              })}
            >
              <Trans id="footer.legal-framework">Rechtliches</Trans>
            </Link>
          </Text>
        </Box>
        <Flex
          sx={{
            flexDirection: ["column", "row"],
            alignItems: ["flex-start", "center"],
          }}
        >
          <Box
            sx={{
              width: "100vw",
              display: ["block", "none"],
              px: 4,
              py: 5,
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderTopStyle: "solid",
              borderBottomStyle: "solid",
              borderTopColor: "monochrome500",
              borderBottomColor: "monochrome500",
            }}
          >
            <LogoDesktop />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
