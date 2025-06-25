import { Trans } from "@lingui/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Dialog,
  IconButton,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  Typography,
} from "@mui/material";
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import { ComponentProps } from "react";
import { createPortal } from "react-dom";

import { LoadingIcon, NoContentHint } from "src/components/hint";
import { useDisclosure } from "src/components/use-disclosure";
import { VisuallyHidden } from "src/components/visually-hidden";
import { useWikiContentQuery } from "src/graphql/queries";
import { Icon } from "src/icons";
import { useLocale } from "src/lib/use-locale";
import { theme } from "src/themes/elcom";

const DialogContent = ({
  contentQuery,
}: {
  contentQuery: ReturnType<typeof useWikiContentQuery>[0];
}) => {
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

  const transform: HTMLReactParserOptions["replace"] = (node, index) => {
    if (node.type === "tag" && node.name === "details") {
      const element = node as Element;
      const summaryNode = element.children.find(
        (c): c is Element => c.type === "tag" && c.name === "summary"
      );

      const contentNodes = element.children.filter(
        (c): c is import("html-react-parser").DOMNode => c !== summaryNode
      );
      return (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<Icon name="chevrondown" />}>
            <Typography fontWeight={700}>
              {summaryNode
                ? domToReact(summaryNode.children as DOMNode[])
                : null}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{domToReact(contentNodes)}</AccordionDetails>
        </Accordion>
      );
    }
  };

  return (
    <Box
      component="section"
      sx={{
        details: { mb: 3 },
        summary: { fontWeight: 700 },
        p: { my: 3 },
        table: {
          borderCollapse: "collapse",
          my: 2,
          tbody: {
            borderColor: "secondary.300",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
          },
          "th:not(:empty)": {
            p: 2,
            "&:not(:first-of-type)": { textAlign: "right" },
          },
          td: {
            borderColor: "secondary.300",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            p: 2,
            "&:not(:first-of-type)": { textAlign: "right" },
          },
        },
      }}
    >
      {parse(contentQuery.data.wikiContent.html, { replace: transform })}
    </Box>
  );
};

export const HelpDialog: React.FC<{
  close: () => void;
  label: string;
  open: boolean;
  slug: string;
}> = ({ close, label, open: open, slug }) => {
  const locale = useLocale();

  const [contentQuery] = useWikiContentQuery({
    variables: { locale, slug },
    pause: !open,
  });

  return (
    <>
      {contentQuery.fetching ? (
        createPortal(
          <Backdrop open={open} sx={{ zIndex: 1000 }} onClick={close}>
            <LoadingIcon sx={{ color: "secondary.800" }} />
          </Backdrop>,
          document.body
        )
      ) : (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={open}
          onClose={close}
          aria-label={label}
          sx={{
            [theme.breakpoints.down("sm")]: {
              "& .MuiDialog-paper": {
                margin: 0,
                height: "100%",
                maxHeight: "initial",
                borderRadius: 0,
                width: "100%",
              },
            },
          }}
        >
          <IconButton
            sx={{
              color: "text",
              position: "absolute",
              right: "20px",
              top: "20px",
            }}
            onClick={close}
          >
            <VisuallyHidden>
              <Trans id="dialog.close">Close dialog</Trans>
            </VisuallyHidden>{" "}
            <Icon name="clear" />
          </IconButton>

          <MuiDialogTitle
            sx={{
              height: "5rem",
              alignItems: "center",
              display: "flex",
              mb: "-1rem",
            }}
          >
            <Typography variant="body2" sx={{ color: "secondary.main" }}>
              <Trans id="dialog.infoprefix">Info:</Trans> {label}
            </Typography>
          </MuiDialogTitle>
          <MuiDialogContent sx={{ "& table": { width: "100%" } }}>
            <DialogContent contentQuery={contentQuery} />
          </MuiDialogContent>
        </Dialog>
      )}
    </>
  );
};

export const InfoDialogButton = ({
  label,
  slug,
  iconOnly,
  iconSize = 16,
  type = "fill",
}: {
  label: string;
  slug: string;
  iconOnly?: boolean;
  iconSize?: number;
  type?: "fill" | "outline";
}) => {
  const {
    isOpen: isHelpDialogOpen,
    close: closeDialog,
    open: openDialog,
  } = useDisclosure();
  return (
    <>
      <IconButton
        color="tertiary"
        sx={{
          fontSize: iconSize === 16 ? [2, 2, 2] : [3, 4, 4],
          paddingRight: 0,
        }}
        onClick={openDialog}
      >
        <Box sx={{ alignItems: "center" }} display="flex">
          <Box sx={{ flexShrink: 0, mr: iconOnly ? 0 : 2 }}>
            <Icon
              name={type === "fill" ? "infocirclefilled" : "infocircle"}
              size={iconSize}
            />
          </Box>{" "}
          {iconOnly ? <VisuallyHidden>{label}</VisuallyHidden> : label}
        </Box>
      </IconButton>
      <HelpDialog
        close={closeDialog}
        label={label}
        open={isHelpDialogOpen}
        slug={slug}
      />
    </>
  );
};

export type InfoDialogButtonProps = ComponentProps<typeof InfoDialogButton>;
