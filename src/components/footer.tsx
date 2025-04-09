import { Trans, t } from "@lingui/macro";
import { Box, IconButton, Link, LinkProps, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

import { HelpDialog } from "src/components/info-dialog";
import { LogoDesktop } from "src/components/logo";
import { useDisclosure } from "src/components/use-disclosure";
import { IconDownload } from "src/icons/old/ic-download";
import { IconInfo } from "src/icons/old/ic-info";
import { IconShare } from "src/icons/old/ic-share";
import { useLocale } from "src/lib/use-locale";
import { useQueryStateSingle } from "src/lib/use-query-state";

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
        borderBottomColor: "grey.500",
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
  const locale = useLocale();
  const [{ period }] = useQueryStateSingle();

  const helpCalculationDisclosure = useDisclosure();
  const helpCsvDisclosure = useDisclosure();
  const helpMunicipalitiesInfoDisclosure = useDisclosure();

  const handleOpenCalculation = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    helpCalculationDisclosure.open();
  };

  const handleOpenCsvDownload = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    helpCsvDisclosure.open();
  };

  const handleOpenMunicipalitiesInfo = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    helpMunicipalitiesInfoDisclosure.open();
  };

  return (
    <Box
      sx={{
        bgcolor: "grey.200",
        borderTop: "1px solid",
        borderColor: "grey.500",
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
            close={helpCalculationDisclosure.close}
            label={t({
              id: "help.calculation",
              message: `Berechnungsgrundlage`,
            })}
            open={helpCalculationDisclosure.isOpen}
            slug="help-calculation"
          />
          <HelpDialog
            close={helpCsvDisclosure.close}
            label={t({
              id: "help.csv-download",
              message: `Daten als .csv`,
            })}
            open={helpCsvDisclosure.isOpen}
            slug="help-download-raw-data"
          />
          <HelpDialog
            close={helpMunicipalitiesInfoDisclosure.close}
            label={t({
              id: "help.municipalities-info",
              message: `Municipalities and grid operators information`,
            })}
            open={helpMunicipalitiesInfoDisclosure.isOpen}
            slug="help-municipalities-and-grid-operators-info"
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
                  color="primary"
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
            href={`/api/municipalities-data.csv?period=${period}`}
            icon={
              <Box sx={{ display: "flex", flexShrink: 0, gap: "1rem" }}>
                <IconButton
                  color="primary"
                  sx={{ p: 0, width: 24, height: 24, cursor: "pointer" }}
                  onClick={handleOpenMunicipalitiesInfo}
                >
                  <IconInfo />
                </IconButton>
                <IconDownload />
              </Box>
            }
          >
            {t({
              id: "footer.municipalities-and-grid-operators",
              message: `Schweizerische Gemeinden und zuständige Stromnetzbetreiber`,
            })}
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

      <Box
        component="footer"
        sx={{
          flexDirection: ["column", "row"],
          justifyContent: ["flex-start", "space-between"],
          alignItems: ["flex-start", "center"],
          bgcolor: "grey.200",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "grey.500",
        }}
        display="flex"
      >
        <Box
          sx={{
            width: "100%",
            px: 6,
            py: 5,
            color: ["grey.900", "grey.700"],
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">
            <Trans id="footer.institution.name">
              Eidgenössische Elektrizitätskommission ElCom
            </Trans>
          </Typography>
          <Typography variant="body2" sx={{ display: "block" }} component="div">
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
          </Typography>
        </Box>
        <Box
          sx={{
            flexDirection: ["column", "row"],
            alignItems: ["flex-start", "center"],
          }}
          display="flex"
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
              borderTopColor: "grey.500",
              borderBottomColor: "grey.500",
            }}
          >
            <LogoDesktop />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
