import { Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import Dialog from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";

import { useWikiContentQuery } from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

import { Icon } from "../icons";

import { LoadingIcon, NoContentHint } from "./hint";
import { useDisclosure } from "./useDisclosure";

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
      component="section"
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
          my: 2,
          tbody: {
            borderColor: "grey.300",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
          },
          "th:not(:empty)": {
            p: 2,
            ":not(:first-of-type)": { textAlign: "right" },
          },
          td: {
            borderColor: "grey.300",
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

export const HelpDialog: React.FC<{
  close: () => void;
  label: string;
  open: boolean;
  slug: string;
}> = ({ close, label, open: open, slug }) => (
  <Dialog
    style={{ zIndex: 999, position: "relative", maxWidth: 800 }}
    isOpen={open}
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
        cursor: "pointer",
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
    <Typography variant="paragraph2" sx={{ color: "secondary.main" }}>
      <Trans id="dialog.infoprefix">Info:</Trans> {label}
    </Typography>
    <DialogContent slug={slug} />
  </Dialog>
);

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
  const {
    isOpen: isHelpDialogOpen,
    close: closeDialog,
    open: openDialog,
  } = useDisclosure();
  return (
    <>
      <Button
        variant="text"
        sx={{ fontSize: smaller ? [2, 2, 2] : [3, 4, 4] }}
        onClick={openDialog}
      >
        <Box sx={{ alignItems: "center" }} display="flex">
          <Box sx={{ flexShrink: 0, mr: iconOnly ? 0 : 2 }}>
            <Icon name="info" size={smaller ? 16 : 20} />
          </Box>{" "}
          {iconOnly ? <VisuallyHidden>{label}</VisuallyHidden> : label}
        </Box>
      </Button>
      <HelpDialog
        close={closeDialog}
        label={label}
        open={isHelpDialogOpen}
        slug={slug}
      />
    </>
  );
};
