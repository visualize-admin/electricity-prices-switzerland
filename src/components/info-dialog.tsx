import { Trans } from "@lingui/macro";
import { Box, IconButton, Typography } from "@mui/material";
import Dialog from "@reach/dialog";

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
    <IconButton
      size="medium"
      sx={{
        position: "absolute",
        right: "20px",
        top: "20px",
      }}
      onClick={close}
      title={
        (
          <Trans id="dialog.close">Dialog schliessen</Trans>
        ) as unknown as string
      }
    >
      <Icon name="clear" />
    </IconButton>
    <Typography component="h3" variant="body2" color="secondary">
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
    <span>
      <IconButton
        color="primary"
        sx={{ fontSize: smaller ? [2, 2, 2] : [3, 4, 4] }}
        onClick={openDialog}
        arial-label={label}
      >
        <Icon name="info" size={smaller ? 16 : 20} />
      </IconButton>
      <HelpDialog
        close={closeDialog}
        label={label}
        open={isHelpDialogOpen}
        slug={slug}
      />
    </span>
  );
};
