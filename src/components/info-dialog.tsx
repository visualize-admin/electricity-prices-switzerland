import { i18n } from "@lingui/core";
import { Trans } from "@lingui/macro";
import Dialog from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import { useState, ReactNode } from "react";
import { Box, Button, Flex, Heading } from "theme-ui";
import { useWikiContentQuery } from "../graphql/queries";
import { Icon } from "../icons";
import { useLocale } from "../lib/use-locale";
import { Loading, LoadingIcon, NoContentHint } from "./hint";

const DialogContent = ({ slug }: { slug: string }) => {
  const locale = useLocale();
  const [contentQuery] = useWikiContentQuery({ variables: { locale, slug } });

  if (contentQuery.fetching) {
    return (
      <Box sx={{ mt: 5 }}>
        <LoadingIcon />
      </Box>
    );
  }

  if (!contentQuery.data?.wikiContent) {
    return (
      <Box sx={{ mt: 5 }}>
        <NoContentHint />
      </Box>
    );
  }

  return (
    <Box
      as="section"
      sx={{
        details: {
          mb: 3,
        },
        summary: {
          fontWeight: "bold",
        },
        p: {
          my: 3,
        },
        table: {
          borderCollapse: "collapse",
          borderColor: "monochrome300",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          my: 2,
          "td,th": {
            borderColor: "monochrome300",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            p: 2,
            ":not(:first-of-type)": { textAlign: "right" },
          },
        },
      }}
      dangerouslySetInnerHTML={{ __html: contentQuery.data.wikiContent.html }}
    />
  );
};

export const InfoDialogButton = ({
  label,
  slug,
  iconOnly,
  smaller,
}: {
  label: string;
  slug: string;
  iconOnly?: boolean;
  smaller?: boolean;
}) => {
  const [showHelpDialog, setShowDialog] = useState<boolean>(false);
  const close = () => setShowDialog(false);
  const open = () => setShowDialog(true);

  return (
    <>
      <Button
        variant="inline"
        sx={{ fontSize: smaller ? [2, 2, 2] : [3, 4, 4] }}
        onClick={open}
      >
        <Flex sx={{ alignItems: "center" }}>
          <Box sx={{ flexShrink: 0, mr: iconOnly ? 0 : 2 }}>
            <Icon name="info" size={smaller ? 16 : 20} />
          </Box>{" "}
          {iconOnly ? <VisuallyHidden>{label}</VisuallyHidden> : label}
        </Flex>
      </Button>
      <Dialog
        style={{ zIndex: 999, position: "relative" }}
        isOpen={showHelpDialog}
        onDismiss={close}
        aria-label={label}
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
          onClick={close}
        >
          <VisuallyHidden>
            <Trans id="dialog.close">Dialog schliessen</Trans>
          </VisuallyHidden>{" "}
          <Box aria-hidden>
            <Icon name="clear" />
          </Box>
        </Button>
        <Heading variant="paragraph2" sx={{ color: "secondary" }}>
          <Trans id="dialog.infoprefix">Info:</Trans> {label}
        </Heading>
        <DialogContent slug={slug} />
      </Dialog>
    </>
  );
};
