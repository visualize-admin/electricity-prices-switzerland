import { Trans, t } from "@lingui/macro";
import { Box, Flex, Link } from "@theme-ui/components";
import { forwardRef, ReactNode } from "react";
import { Icon } from "../icons";
import { useLocale } from "../lib/use-locale";
import { useQueryStateSingle } from "../lib/use-query-state";

import { InfoDialogButton } from "./info-dialog";
import { LogoDesktop } from "./logo";

export const Footer = () => {
  const locale = useLocale();
  const [{ period }] = useQueryStateSingle();

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
        <InfoDialogButton
          slug="help-calculation"
          label={t({ id: "help.calculation", message: `Berechnungsgrundlage` })}
        />
      </Box>
      <Box
        sx={{
          bg: "monochrome200",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome500",
          px: 4,
          py: 6,
          display: "flex",
          alignItems: "center",
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
            <Box as="span" sx={{ ml: 1, display: "inline-block" }}>
              &nbsp;
            </Box>
          </Flex>
        </Link>
        <InfoDialogButton
          smaller
          iconOnly
          sx={{ ml: 1 }}
          slug="help-download-raw-data"
          label={t({
            id: "help.download-raw-data",
            message: `Rohdaten`,
          })}
        />
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
    </>
  );
};
