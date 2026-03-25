import { t, Trans } from "@lingui/macro";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import * as Vaul from "vaul";

import { TooltipMenu } from "src/components/tooltip-menu";
import { useDisclosure } from "src/components/use-disclosure";
import useVaulStyles from "src/components/use-vaul-styles";
import { Icon } from "src/icons";
import { copyToClipboard } from "src/lib/copy-to-clipboard";
import { useIsMobile } from "src/lib/use-mobile";

const ShareContent = ({
  hasCopied,
  onCopyClick,
}: {
  hasCopied: boolean;
  onCopyClick: () => void;
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
      value={window.location.toString()}
      sx={{ minWidth: "100%", mr: 5 }}
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const { classes } = useVaulStyles();

  const isOpen = Boolean(anchorEl);

  const handleClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(ev.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        onClick={handleClick}
        startIcon={<Icon name="share" size={20} />}
        sx={{ color: "text.primary" }}
      >
        {t({ id: "map.share", message: "Share" })}
      </Button>

      {isMobile ? (
        <Vaul.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                  onClick={handleClose}
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
        <TooltipMenu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={handleClose}
          slotProps={{ paper: { sx: { px: 3, py: 2, width: 300 } } }}
        >
          <ShareContent
            hasCopied={hasCopied}
            onCopyClick={handleClickCopyButton}
          />
        </TooltipMenu>
      )}
    </>
  );
};

export default ShareButton;
