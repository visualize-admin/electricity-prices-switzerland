import { Deck } from "@deck.gl/core/typed";
import html2canvas from "html2canvas";

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type);
  });

export type PaperSize = "a4" | "a3";

interface ScreenshotSizeConfig {
  image: { width: number; height: number };
  canvas: { width: number; height: number };
  legendScale: number;
  legendPaddingPercent: number;
}

const IMAGE_RATIO = 1.2;
const CANVAS_RATIO = 1.53;
const A3_IMAGE_WIDTH = 4000;
const A3_CANVAS_WIDTH = 1200;

export const SCREENSHOT_SIZES: Record<PaperSize, ScreenshotSizeConfig> = {
  a3: {
    image: {
      width: A3_IMAGE_WIDTH,
      height: Math.round(A3_IMAGE_WIDTH / IMAGE_RATIO),
    },
    canvas: {
      width: A3_CANVAS_WIDTH,
      height: Math.round(A3_CANVAS_WIDTH / CANVAS_RATIO),
    },
    legendScale: 4,
    legendPaddingPercent: 0.6,
  },
  a4: {
    image: {
      width: Math.round(A3_IMAGE_WIDTH / Math.SQRT2),
      height: Math.round(A3_IMAGE_WIDTH / Math.SQRT2 / IMAGE_RATIO),
    },
    canvas: {
      width: Math.round(A3_CANVAS_WIDTH / Math.SQRT2),
      height: Math.round(A3_CANVAS_WIDTH / Math.SQRT2 / CANVAS_RATIO),
    },
    legendScale: 4 / Math.SQRT2,
    legendPaddingPercent: 0.6,
  },
};

export const DEFAULT_PAPER_SIZE: PaperSize = "a3";

export const SCREENSHOT_CANVAS_SIZE = SCREENSHOT_SIZES[DEFAULT_PAPER_SIZE].canvas;

/**
 * Get the map as an image, using the Deck.gl canvas and html2canvas to get
 * the legend as an image. Supports A3/A4 paper sizes.
 */
export const getMapImageData = async (
  deck: Deck,
  legend: HTMLElement | undefined,
  paperSize: PaperSize = DEFAULT_PAPER_SIZE
) => {
  if (!deck || "canvas" in deck === false) {
    return;
  }

  // @ts-expect-error canvas is private
  const canvas = deck.canvas;
  if (!canvas) {
    return;
  }

  const sizeConfig = SCREENSHOT_SIZES[paperSize];

  const initialSize = {
    width: canvas.width,
    height: canvas.height,
  };

  const imageSize = {
    width: sizeConfig.image.width * 2,
    height: sizeConfig.image.height * 2,
  };
  const canvasSize = {
    width: sizeConfig.canvas.width * 2,
    height: sizeConfig.canvas.height * 2,
  };

  Object.assign(canvas, canvasSize);
  deck.redraw("New size");

  const newCanvas = document.createElement("canvas");
  newCanvas.width = imageSize.width;
  newCanvas.height = imageSize.height;
  const context = newCanvas.getContext("2d");
  if (!context) {
    return;
  }

  // Using html2canvas, take the legend element, and draw it on the new canvas
  // Make a new canvas element to convert the image to a png
  // We need a new canvas since we will draw the legend onto it
  context.fillStyle = "white";
  context.fillRect(0, 0, newCanvas.width, newCanvas.height);

  const ratio = window.devicePixelRatio;
  // Scale the map canvas up to fill the image width. Since the canvas aspect
  // ratio (CANVAS_RATIO) is wider than the image ratio (IMAGE_RATIO), the
  // scaled canvas will be shorter than the image — center it vertically.
  const mapScale = newCanvas.width / canvas.width;
  const drawnMapHeight = canvas.height * mapScale;
  context.drawImage(
    canvas,
    0,
    (newCanvas.height - drawnMapHeight) / 2,
    newCanvas.width,
    drawnMapHeight
  );

  if (legend) {
    const legendCanvas = await html2canvas(legend);
    // We need to draw the legend using the device pixel ratio otherwise we get
    // difference between different browsers (Safari legend would be bigger somehow)
    const { width, height } = legend.getBoundingClientRect();

    const legendPadding =
      (sizeConfig.legendPaddingPercent / 100) * newCanvas.width;
    context.drawImage(
      legendCanvas,
      legendPadding,
      legendPadding,
      width * ratio * sizeConfig.legendScale,
      height * ratio * sizeConfig.legendScale
    );
  }

  // Returns the canvas as a png
  const res = await toBlob(newCanvas, "image/png").then((blob) =>
    blob ? URL.createObjectURL(blob) : undefined
  );

  Object.assign(canvas, initialSize);
  deck.redraw("Initial size");

  return res;
};
