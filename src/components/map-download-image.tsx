import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import * as Vaul from "vaul";

import { LoadingIconInline } from "src/components/hint";
import { TooltipMenu } from "src/components/tooltip-menu";
import useVaulStyles from "src/components/use-vaul-styles";
import {
  DEFAULT_PAPER_SIZE,
  PaperSize,
  SCREENSHOT_SIZES,
} from "src/domain/screenshot";
import { Icon } from "src/icons";
import { useIsMobile } from "src/lib/use-mobile";

const MapDownloadContent = ({
  paperSize,
  onPaperSizeChange,
  onDownload,
  downloading,
  isMobile,
}: {
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  onDownload: () => void;
  downloading: boolean;
  isMobile: boolean;
}) => (
  <>
    <RadioGroup
      value={paperSize}
      onChange={(_, value) => onPaperSizeChange(value as PaperSize)}
      sx={{ py: 2 }}
    >
      <FormControlLabel
        value="small"
        control={<Radio size="small" sx={{ mt: -2 }} />}
        sx={{ alignItems: "flex-start", mb: 1 }}
        label={
          <Typography variant="body3" display="flex" alignItems="center" gap={1}>
            {t({ id: "map.download.paper-size.small", message: "Small" })}
            <Tooltip
              title={t({
                id: "map.download.paper-size.small.info",
                message: `${SCREENSHOT_SIZES.small.image.width} × ${SCREENSHOT_SIZES.small.image.height} px`,
              })}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <Icon name="infocircle" size={16} />
              </span>
            </Tooltip>
          </Typography>
        }
      />
      <FormControlLabel
        value="a4"
        control={<Radio size="small" sx={{ mt: -2 }} />}
        sx={{ alignItems: "flex-start", mb: 1 }}
        label={
          <Typography variant="body3" display="flex" alignItems="center" gap={1}>
            {t({ id: "map.download.paper-size.a4", message: "Medium (A4)" })}
            <Tooltip
              title={t({
                id: "map.download.paper-size.a4.info",
                message: `${SCREENSHOT_SIZES.a4.image.width} × ${SCREENSHOT_SIZES.a4.image.height} px, 300dpi`,
              })}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <Icon name="infocircle" size={16} />
              </span>
            </Tooltip>
          </Typography>
        }
      />
      <FormControlLabel
        value="a3"
        disabled={isMobile}
        sx={{ alignItems: "flex-start", mb: 1 }}
        control={<Radio size="small" sx={{ mt: -2 }} />}
        label={
          <div>
            <Typography variant="body3" display="flex" alignItems="center" gap={1}>
              {t({ id: "map.download.paper-size.a3", message: "Large (A3)" })}
              <Tooltip
                title={t({
                  id: "map.download.paper-size.a3.info",
                  message: `${SCREENSHOT_SIZES.a3.image.width} × ${SCREENSHOT_SIZES.a3.image.height} px, 300dpi`,
                })}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  <Icon name="infocircle" size={16} />
                </span>
              </Tooltip>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {isMobile ? (
                <Trans id="map.download.paper-size.a3.warning.mobile">
                  Unavailable on mobile, please use a desktop browser
                </Trans>
              ) : (
                <Trans id="map.download.paper-size.a3.warning">
                  May be resource intensive and take longer to generate
                </Trans>
              )}
            </Typography>
          </div>
        }
      />
    </RadioGroup>
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      onClick={onDownload}
      disabled={downloading}
      startIcon={
        downloading ? (
          <LoadingIconInline size={20} />
        ) : (
          <Icon name="download" size={20} />
        )
      }
      sx={{ mt: 2 }}
    >
      <Trans id="map.download.button">Download</Trans>
    </Button>
  </>
);

export const MapDownloadImage = ({
  fileName,
  getImageData,
}: {
  fileName: string;
  getImageData: (paperSize: PaperSize) => Promise<string | undefined>;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>(DEFAULT_PAPER_SIZE);
  const [downloading, setDownloading] = useState(false);
  const isMobile = useIsMobile();
  const { classes } = useVaulStyles();

  const isOpen = Boolean(anchorEl);

  const handleClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(ev.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const imageData = await getImageData(paperSize);
      if (!imageData) return;
      const a = document.createElement("a");
      a.href = imageData;
      const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
      const base = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
      a.download = `${base}-${paperSize}${ext}`;
      a.click();
    } finally {
      setDownloading(false);
      handleClose();
    }
  };

  const content = (
    <MapDownloadContent
      paperSize={paperSize}
      onPaperSizeChange={setPaperSize}
      onDownload={handleDownload}
      downloading={downloading}
      isMobile={isMobile}
    />
  );

  return (
    <>
      <Button
        variant="text"
        onClick={handleClick}
        startIcon={<Icon name="download" size={20} />}
        sx={{ color: "text.primary" }}
      >
        {t({ id: "image.download", message: "Download image" })}
      </Button>

      {isMobile ? (
        <Vaul.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <Vaul.Portal>
            <Vaul.Overlay className={classes.overlay} />
            <Vaul.Content className={classes.content}>
              <div className={classes.handle}></div>
              <div className={classes.header}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  <Trans id="map.download.title">Download image</Trans>
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
                <Box p={2}>{content}</Box>
              </div>
            </Vaul.Content>
          </Vaul.Portal>
        </Vaul.Root>
      ) : (
        <TooltipMenu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={handleClose}
          transformOrigin={{ vertical: 240, horizontal: "center" }}
          slotProps={{ paper: { sx: { px: 4, py: 2, width: 300 } } }}
        >
          <Typography variant="h6" mb={2}>
            <Trans id="map.download.title">Download image</Trans>
          </Typography>
          {content}
        </TooltipMenu>
      )}
    </>
  );
};
