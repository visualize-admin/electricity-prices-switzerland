import { Trans, t } from "@lingui/macro";
import { Box, Link } from "@mui/material";
import { IconButton, LinkProps, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

import Flex from "src/components/flex";
import { useLocale } from "src/lib/use-locale";
import { useQueryStateSingle } from "src/lib/use-query-state";
import { makeStyles } from "src/themes/makeStyles";

import { IconDownload } from "../icons/ic-download";
import { IconInfo } from "../icons/ic-info";
import { IconShare } from "../icons/ic-share";

import { HelpDialog } from "./info-dialog";
import { LogoDesktop } from "./logo";
import { useDisclosure } from "./useDisclosure";

const useStyles = makeStyles()((theme) => ({
  footerLink: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: theme.palette.grey[500],
    padding: theme.spacing(4),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footerContainer: {
    bgcolor: theme.palette.grey[200],
    borderTop: "1px solid",
    borderColor: theme.palette.grey[500],
    paddingTop: theme.spacing(6),
  },

  footerLinks: {
    display: "grid",
    padding: theme.spacing(6),
    marginBottom: theme.spacing(8),
    gap: theme.spacing(6),
    gridTemplateColumns: ["1fr", "1fr 1fr"],
  },

  footerLegal: {
    flexDirection: ["column", "row"],
    justifyContent: ["flex-start", "space-between"],
    alignItems: ["flex-start", "center"],
    bgcolor: theme.palette.grey[200],
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: theme.palette.grey[500],
  },

  legal: {
    width: "100%",
    padding: theme.spacing(5, 6),
    color: [theme.palette.grey[900], theme.palette.grey[700]],
    display: "flex",
    justifyContent: "space-between",
  },

  logo: {
    width: "100vw",
    display: ["block", "none"],
    padding: theme.spacing(5, 4),
    borderTopWidth: "1px",
    borderBottomWidth: "1px",
    borderTopStyle: "solid",
    borderBottomStyle: "solid",
    borderTopColor: theme.palette.grey[500],
    borderBottomColor: theme.palette.grey[500],
  },
}));

const FooterLink = ({
  children,
  icon,
  ...props
}: PropsWithChildren<
  {
    icon?: React.ReactNode;
  } & LinkProps
>) => {
  const { classes } = useStyles();
  return (
    <Link
      {...props}
      typography="body1"
      color="primary"
      underline="none"
      className={classes.footerLink}
    >
      <div>{children}</div>
      {icon}
    </Link>
  );
};

const FooterTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography variant="h2" sx={{ mb: 6 }}>
      {children}
    </Typography>
  );
};
const FooterSection = ({ children }: { children: React.ReactNode }) => {
  return <Box>{children}</Box>;
};

export const Footer = () => {
  const { classes } = useStyles();
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
    <Box className={classes.footerContainer}>
      <Box className={classes.footerLinks}>
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
                  sx={{ p: 0 }}
                  onClick={handleOpenCsvDownload}
                  color="primary"
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

      <Flex component="footer" className={classes.footerLegal}>
        <Box className={classes.legal}>
          <Typography variant="body2">
            <Trans id="footer.institution.name">
              Eidgenössische Elektrizitätskommission ElCom
            </Trans>
          </Typography>
          <Typography variant="body2" sx={{ display: "block" }} component="div">
            <Link
              target="_blank"
              href={t({
                id: "footer.legal-framework.link",
                message: "https://www.admin.ch/gov/de/start/rechtliches.html",
              })}
            >
              <Trans id="footer.legal-framework">Rechtliches</Trans>
            </Link>
          </Typography>
        </Box>
        <Flex
          sx={{
            flexDirection: ["column", "row"],
            alignItems: ["flex-start", "center"],
          }}
        >
          <Box className={classes.logo}>
            <LogoDesktop />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
