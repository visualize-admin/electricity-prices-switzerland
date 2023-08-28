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
import { BoxProps, LinkProps } from "theme-ui";
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
      sx={{
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
        p: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textDecoration: "none",

        color: "primary",
        "&:visited": {
          color: "primary",
        },
        "&:hover": {
          color: "primaryHover",
        },
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

  const handleOpenCalculation = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    openHelpCalculation();
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
          <FooterTitle>Weiterführende Informationen</FooterTitle>
          <FooterLink
            sx={{ cursor: "pointer" }}
            onClick={handleOpenCalculation}
            href="#"
            icon={<IconInfo />}
          >
            {t({
              id: "footer.calculation-basics",
              message: `Berechnungsgrundlage`,
            })}
          </FooterLink>
          <HelpDialog
            close={closeHelpCalculation}
            label={t({
              id: "help.calculation",
              message: `Berechnungsgrundlage`,
            })}
            open={isHelpCalculationOpen}
            slug="help.calculation"
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
            icon={<IconDownload />}
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
            width: ["100%", "auto"],
            px: 4,
            py: 5,
            color: ["monochrome900", "monochrome700"],
          }}
        >
          <Trans id="footer.institution.name">ElCom</Trans>
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
