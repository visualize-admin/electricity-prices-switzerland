import { t, Trans } from "@lingui/macro";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import * as Vaul from "vaul";

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import { useDisclosure } from "src/components/use-disclosure";
import { useOutsideClick } from "src/components/use-outside-click";
import useVaulStyles from "src/components/use-vaul-styles";
import { Icon } from "src/icons";
import { copyToClipboard } from "src/lib/copy-to-clipboard";
import { useIsMobile } from "src/lib/use-mobile";

const ShareContent = ({
  hasCopied,
  onCopyClick,
  onFocus,
  onBlur,
}: {
  hasCopied: boolean;
  onCopyClick: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) => (
  <>
    <Box
      display="flex"
      mb={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant="h6">URL</Typography>
      <Typography variant="caption" color="success">
        {hasCopied
          ? t({ id: "share.url-copied", message: "URL copied ✅" })
          : ""}
      </Typography>
    </Box>
    <TextField
      onFocus={onFocus}
      onBlur={onBlur}
      value={window.location.toString()}
      sx={{
        minWidth: "100%",
        mr: 5,
      }}
      InputProps={{
        endAdornment: (
          <Button
            color="secondary"
            onClick={onCopyClick}
            sx={{ minWidth: "auto", pointerEvents: "auto" }}
          >
            <Icon name="duplicate" />
          </Button>
        ),
      }}
    />
  </>
);

const ShareButton = () => {
  const { isOpen, open, close } = useDisclosure();
  const { open: setFocusOn, close: setFocusOff } = useDisclosure();
  const tooltipBoxRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLButtonElement>(null);
  const [linkRect, setLinkRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();
  const { classes } = useVaulStyles();

  const handleClick = () => {
    open();
    if (!isMobile) {
      setLinkRect(linkRef.current?.getBoundingClientRect() ?? null);
    }
  };

  useOutsideClick(tooltipBoxRef, () => {
    if (!isMobile) {
      close();
      setFocusOff();
    }
  });

  const { isOpen: hasCopied, setIsOpen: setCopied } = useDisclosure();
  const handleClickCopyButton = async () => {
    await copyToClipboard(window.location.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <Button
        variant="text"
        ref={linkRef}
        onClick={handleClick}
        startIcon={<Icon name="share" size={20} />}
        sx={{
          color: "text.primary",
        }}
      >
        {t({ id: "map.share", message: "Share" })}
      </Button>

      {isMobile ? (
        <Vaul.Root open={isOpen} onOpenChange={(isOpen) => !isOpen && close()}>
          <Vaul.Portal>
            <Vaul.Overlay className={classes.overlay} />
            <Vaul.Content className={classes.content}>
              <div className={classes.handle}></div>
              <div className={classes.header}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  <Trans id="map.share">Share</Trans>
                </Typography>
                <Button
                  variant="text"
                  onClick={close}
                  color="primary"
                  sx={{ pr: 0 }}
                >
                  <Trans id="mobile-drawer.close">Close</Trans>
                </Button>
              </div>
              <div className={classes.scrollArea}>
                <Box p={2}>
                  <ShareContent
                    hasCopied={hasCopied}
                    onCopyClick={handleClickCopyButton}
                  />
                </Box>
              </div>
            </Vaul.Content>
          </Vaul.Portal>
        </Vaul.Root>
      ) : (
        <Box position="relative">
          {isOpen && (
            <TooltipBox
              ref={tooltipBoxRef}
              placement={{ x: "center", y: "top" }}
              interactive
              sx={{
                position: "absolute",
                bottom: (linkRect?.height ?? 0) + 16,
                width: "300px",
                left: -1000,
                right: -1000,
                margin: "auto",
                zIndex: (theme) => theme.zIndex.tooltip,
              }}
            >
              <ShareContent
                hasCopied={hasCopied}
                onCopyClick={handleClickCopyButton}
                onFocus={setFocusOn}
                onBlur={setFocusOff}
              />
            </TooltipBox>
          )}
        </Box>
      )}
    </>
  );
};

export default ShareButton;
