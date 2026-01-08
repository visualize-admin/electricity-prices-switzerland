import { t } from "@lingui/macro";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import { useDisclosure } from "src/components/use-disclosure";
import { useOutsideClick } from "src/components/use-outside-click";
import { Icon } from "src/icons";
import { copyToClipboard } from "src/lib/copy-to-clipboard";

const ShareButton = () => {
  const { isOpen, open, close } = useDisclosure();
  const { open: setFocusOn, close: setFocusOff } = useDisclosure();
  const tooltipBoxRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLButtonElement>(null);
  const [linkRect, setLinkRect] = useState<DOMRect | null>(null);

  const handleClick = () => {
    open();
    setLinkRect(linkRef.current?.getBoundingClientRect() ?? null);
  };

  useOutsideClick(tooltipBoxRef, () => {
    close();
    setFocusOff();
  });

  const { isOpen: hasCopied, setIsOpen: setCopied } = useDisclosure();
  const handleClickCopyButton = async () => {
    await copyToClipboard(window.location.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Box position="relative">
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
          }}
        >
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
            onFocus={setFocusOn}
            onBlur={setFocusOff}
            value={window.location.toString()}
            sx={{
              minWidth: "100%",
              mr: 5,
            }}
            InputProps={{
              endAdornment: (
                <Button
                  color="secondary"
                  onClick={handleClickCopyButton}
                  sx={{ minWidth: "auto" }}
                >
                  <Icon name="duplicate" />
                </Button>
              ),
            }}
          />
        </TooltipBox>
      )}
    </Box>
  );
};

export default ShareButton;
