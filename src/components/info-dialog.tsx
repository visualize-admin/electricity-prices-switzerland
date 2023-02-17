import { useTranslation } from "next-i18next";
import Dialog from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import { useState } from "react";
import { Box, Button, Flex, Heading } from "theme-ui";
import { useWikiContentQuery } from "../graphql/queries";
import { Icon } from "../icons";
import { useLocale } from "../lib/use-locale";
import { LoadingIcon, NoContentHint } from "./hint";

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
          my: 2,
          tbody: {
            borderColor: "monochrome300",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
          },
          "th:not(:empty)": {
            p: 2,
            ":not(:first-of-type)": { textAlign: "right" },
          },
          td: {
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
  const { t } = useTranslation();
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
        style={{ zIndex: 999, position: "relative", maxWidth: 800 }}
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
            cursor: "pointer",
          }}
          onClick={close}
        >
          <VisuallyHidden>
            {t("dialog.close", "Dialog schliessen")}
          </VisuallyHidden>{" "}
          <Box aria-hidden>
            <Icon name="clear" />
          </Box>
        </Button>
        <Heading variant="paragraph2" sx={{ color: "secondary" }}>
          {t("dialog.infoprefix", "Info:")} {label}
        </Heading>
        <DialogContent slug={slug} />
      </Dialog>
    </>
  );
};
