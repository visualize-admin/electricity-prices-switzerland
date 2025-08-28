import { Deck } from "@deck.gl/core/typed";
import html2canvas from "html2canvas";

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type);
  });

const SCREENSHOT_IMAGE_SIZE = {
  width: 1120,
  height: 928,
};

export const SCREENSHOT_CANVAS_SIZE = {
  width: 1120,
  height: 730,
};

/**
 * Get the map as an image, using the Deck.gl canvas and html2canvas to get
 * the legend as an image.
 */
export const getImageData = async (
  deck: Deck,
  legend: HTMLElement | undefined
) => {
  if (!deck || "canvas" in deck === false) {
    return;
  }

  // @ts-expect-error canvas is private
  const canvas = deck.canvas;
  if (!canvas) {
    return;
  }

  const initialSize = {
    width: canvas.width,
    height: canvas.height,
  };

  const imageSize = {
    width: SCREENSHOT_IMAGE_SIZE.width * 2,
    height: SCREENSHOT_IMAGE_SIZE.height * 2,
  };
  const canvasSize = {
    width: SCREENSHOT_CANVAS_SIZE.width * 2,
    height: SCREENSHOT_CANVAS_SIZE.height * 2,
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
  context.drawImage(
    canvas,
    (newCanvas.width - canvas.width) / 2,
    (newCanvas.height - canvas.height) / 2,
    canvas.width,
    canvas.height
  );

  if (legend) {
    const legendCanvas = await html2canvas(legend);
    // We need to draw the legend using the device pixel ratio otherwise we get
    // difference between different browsers (Safari legend would be bigger somehow)
    const { width, height } = legend.getBoundingClientRect();

    const legendPadding = 24;
    context.drawImage(
      legendCanvas,
      legendPadding,
      legendPadding,
      width * ratio,
      height * ratio
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
