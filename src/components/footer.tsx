import { Trans } from "@lingui/macro";
import { Box, Flex, Link, Button, Heading } from "@theme-ui/components";
import NextLink from "next/link";
import { useState, ReactNode, forwardRef } from "react";
import contentRoutes from "../content-routes.json";
import { useLocale } from "../lib/use-locale";
import { LogoDesktop } from "./logo";
import { Icon } from "../icons";
import { useQueryStateSingle } from "../lib/use-query-state";
import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import { useI18n } from "./i18n-context";

export const Footer = ({
  calculationHelpText,
}: {
  calculationHelpText: string;
}) => {
  const locale = useLocale();
  const i18n = useI18n();
  const [{ period }] = useQueryStateSingle();

  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);

  return (
    <>
      <Box
        sx={{
          bg: "monochrome200",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome500",
          px: 4,
          py: 6,
          position: "relative",
        }}
      >
        <Button
          variant="inline"
          sx={{ fontSize: [3, 4, 4] }}
          onClick={() => {
            setShowHelpDialog(true);
          }}
        >
          <Flex sx={{ alignItems: "center" }}>
            <Box sx={{ flexShrink: 0, mr: 2 }}>
              <Icon name="info" size={20} />
            </Box>{" "}
            <Trans id="help.calculation">Berechnungsgrundlagen</Trans>
          </Flex>
        </Button>
        <Dialog
          style={{ zIndex: 999, position: "relative" }}
          isOpen={showHelpDialog}
          onDismiss={() => {
            setShowHelpDialog(false);
          }}
          aria-label={i18n._("help.calculation")}
        >
          <Button
            variant="reset"
            sx={{
              color: "text",
              p: 0,
              position: "absolute",
              right: "20px",
              top: "20px",
            }}
            onClick={() => {
              setShowHelpDialog(false);
            }}
          >
            <VisuallyHidden>Close</VisuallyHidden>{" "}
            <Box aria-hidden>
              <Icon name="clear" />
            </Box>
          </Button>
          <Heading variant="heading2">
            <Trans id="help.calculation">Berechnungsgrundlagen</Trans>
          </Heading>
          <Box dangerouslySetInnerHTML={{ __html: calculationHelpText }}></Box>
        </Dialog>
      </Box>
      <Box
        sx={{
          bg: "monochrome200",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome500",
          px: 4,
          py: 6,
        }}
      >
        <Link
          href={`/api/data-export?period=${period}&locale=${locale}`}
          variant="inline"
          sx={{ fontSize: [3, 4, 4] }}
        >
          <Flex sx={{ alignItems: "center" }}>
            <Box sx={{ flexShrink: 0, mr: 2 }}>
              <Icon name="excel" size={20} />
            </Box>{" "}
            <Trans id="download.rawdata">Rohdaten</Trans> {period} (
            <Trans id="download.filetype.csv">CSV-Datei</Trans>)
          </Flex>
        </Link>
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
          <Flex sx={{ flexDirection: ["column", "row"] }} pb={[4, 0]}>
            {/* <FooterLink>
            <Trans id="footer.help">Help</Trans>
          </FooterLink>
          <FooterLink>
            <Trans id="footer.contact">Contact</Trans>
          </FooterLink> */}
          </Flex>

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

          <Flex sx={{ justifyContent: "flex-end", width: ["100%", "auto"] }}>
            {/* <NextLink href={contentRoutes.legal[locale].path} passHref>
            <FooterLinkBottom>
              {contentRoutes.legal[locale].title}
            </FooterLinkBottom>
          </NextLink>
          <NextLink href={contentRoutes.imprint[locale].path} passHref>
            <FooterLinkBottom>
              {contentRoutes.imprint[locale].title}
            </FooterLinkBottom>
          </NextLink> */}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

const FooterLink = ({ children, ...props }: { children: ReactNode }) => (
  <Link
    {...props}
    sx={{
      width: ["100%", "auto"],
      px: [4, 3],
      py: [3, 4],
      color: "primary",
      fontSize: 3,
      fontFamily: "body",
      textDecoration: "none",
      cursor: "pointer",
      ":hover": {
        color: "primaryHover",
      },
      ":active": {
        color: "primaryHover",
      },
      ":disabled": {
        cursor: "initial",
        color: "primaryDisabled",
      },
    }}
  >
    {children}
  </Link>
);

const FooterLinkBottom = forwardRef<HTMLAnchorElement, { children: ReactNode }>(
  ({ children, ...props }, ref) => (
    <Link
      ref={ref}
      {...props}
      sx={{
        px: [4, 3],
        py: [3, 4],
        color: "primary",
        fontSize: 3,
        fontFamily: "body",
        borderLeftWidth: ["1px", 0],
        borderLeftStyle: "solid",
        borderLeftColor: "monochrome500",
        textDecoration: "none",
        cursor: "pointer",
        ":hover": {
          color: "primaryHover",
        },
        ":active": {
          color: "primaryHover",
        },
        ":disabled": {
          cursor: "initial",
          color: "primaryDisabled",
        },
      }}
    >
      {children}
    </Link>
  )
);
