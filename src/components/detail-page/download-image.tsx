import { Trans } from "@lingui/macro";
import { Box, Link as MUILink, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import * as React from "react";

export type Download =
  | "map"
  | "components"
  | "evolution"
  | "distribution"
  | "comparison";

const getImageDataFromElement = async (elementId: string): Promise<string> => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element as HTMLElement);
  return canvas.toDataURL("image/png");
};

// helper to wait a frame
const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Used to download an image of a specific element or from an element
 * that directly defines a way to get the image data.
 */
export const DownloadImage = ({
  fileName,
  elementId,
  getImageData,
}: {
  downloadType?: string;
  fileName: string;

  // Either elementId or getImageData must be provided
  elementId?: string;
  getImageData?: () => Promise<string | undefined>;
}) => {
  const [downloading, setDownloading] = React.useState(false);
  const onDownload: React.MouseEventHandler = async (ev) => {
    ev.preventDefault();
    setDownloading(true);
    try {
      await nextFrame();
      const imageData = elementId
        ? await getImageDataFromElement(elementId)
        : await getImageData!();

      if (!imageData) {
        return;
      }
      const a = document.createElement("a");
      a.href = imageData;
      a.download = fileName;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      {downloading ? null : (
        <MUILink
          variant="inline"
          onClick={onDownload}
          target="_blank"
          rel="noopener noreferrer"
          href="#"
        >
          <Trans id="image.download">Bild herunterladen</Trans>
        </MUILink>
      )}
      {/* This text is shown only when the image is downloading, this is done through
      a global class on body */}
      {downloading ? (
        <Typography variant="meta" sx={{ mt: 4 }}>
          <Trans id="image.download.source">
            Eidgenössische Elektrizitätskommission ElCom
          </Trans>{" "}
          -<Trans id="image.download.unit">Tarifvergleich in Rp./kWh</Trans>
        </Typography>
      ) : null}
    </Box>
  );
};
