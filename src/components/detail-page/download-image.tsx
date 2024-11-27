import { Trans } from "@lingui/macro";
import { Link as MUILink } from "@mui/material";
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
  const onDownload: React.MouseEventHandler = async (ev) => {
    ev.preventDefault();
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
  };

  return (
    <MUILink
      variant="inline"
      onClick={onDownload}
      target="_blank"
      rel="noopener noreferrer"
      href="#"
    >
      <Trans id="image.download">Bild herunterladen</Trans>
    </MUILink>
  );
};
