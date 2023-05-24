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
import { SectionContentContainer } from "./SectionContentContainer";

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
      sx={{
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
        p: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textDecoration: "none",
        cursor: "pointer",

        color: "primary",
        "&:visited": {
          color: "primary",
        },
        "&:hover": {
          color: "primaryHover",
        },
      }}
      {...props}
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
  return (
    <>
      <SectionContentContainer
        sx={{
          bg: "monochrome200",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome500",
        }}
      >
        <Box
          sx={{
            paddingTop: 6,
            width: "100%",
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
              <FooterLink onClick={openHelpCalculation} icon={<IconShare />}>
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
                href={t({
                  id: "footer.energy-saving.link",
                  message: "https://www.dont-waste.ch/de",
                })}
                icon={<IconShare />}
              >
                {t({ id: "footer.energy-saving", message: "Energiesparen" })}
              </FooterLink>

              <FooterLink
                href={t({
                  id: "footer.supply-situation.link",
                  message:
                    "https://www.bwl.admin.ch/bwl/de/home/themen/energie/energie-aktuelle-lage.html",
                })}
                icon={<IconShare />}
              >
                {t({
                  id: "footer.supply-situation",
                  message: "Versorgungslage",
                })}
              </FooterLink>
              <FooterLink
                href={t({
                  id: "footer.power-supply.link",
                  message:
                    "https://www.bfe.admin.ch/bfe/de/home/versorgung/stromversorgung.html",
                })}
                icon={<IconShare />}
              >
                {t({
                  id: "footer.power-supply",
                  message: "Stromversorgung",
                })}
              </FooterLink>
              <FooterLink
                href={t({
                  id: "footer.gas-supply.link",
                  message:
                    "https://www.bfe.admin.ch/bfe/de/home/gasversorgung/gasversorgungsgesetz.html",
                })}
                icon={<IconShare />}
              >
                {t({
                  id: "footer.gas-supply",
                  message: "Gasversorgung",
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
                href={t({
                  id: "footer.data-on-opendata-swiss.link",
                  message:
                    "https://opendata.swiss/de/organization/bundesamt-fur-energie-bfe?q=energiedashboard",
                })}
                icon={<IconDownload />}
              >
                {t({
                  id: "footer.data-on-opendata-swiss",
                  message: "Daten auf opendata.swiss",
                })}
              </FooterLink>
              <FooterLink
                href={t({
                  id: "footer.create-data-visualizations.link",
                  message: "https://visualize.admin.ch/de",
                })}
                icon={<IconDownload />}
              >
                {t({
                  id: "footer.create-data-visualizations",
                  message: "Datenvisualisierungen erstellen",
                })}
              </FooterLink>
            </FooterSection>
          </Box>
        </Box>
        <Flex
          as="footer"
          sx={{
            flexDirection: ["column", "row"],
            justifyContent: ["flex-start", "space-between"],
            alignItems: ["flex-start", "center"],
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
      </SectionContentContainer>
    </>
  );
};
