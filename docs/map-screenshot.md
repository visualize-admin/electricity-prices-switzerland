# Map screenshot

Users can download the map as a PNG via the **Download image** button, choosing between A4 and A3 paper sizes.

⚠️ The A3 choice is disabled on mobile as it is too resource intensive, the tab would reload.

## Key files

| File | Role |
|---|---|
| `src/domain/screenshot.ts` | Paper size configs (`SCREENSHOT_SIZES`), `getMapImageData` — composites map canvas + legend into the final PNG |
| `src/components/map-download-image.tsx` | Download button UI — paper size picker (desktop: `TooltipMenu`, mobile: Vaul drawer) |
| `src/components/generic-map.tsx` | Owns the offscreen canvas lifecycle (see below) |
| `src/components/map-helpers.tsx` | `MapRenderMode` type, `getStyles(mode)` — scales pixel-based line widths for print |
| `src/components/map-layers.tsx` | Layer factories — all accept `renderMode` and call `getStyles` |
| `src/components/energy-prices-map.tsx` | Passes `makeScreenshotLayers={makeLayers}` to `GenericMap` |
| `src/components/sunshine-map.tsx` | Same as above |

## Offscreen canvas

The screenshot uses a **separate DeckGL instance** rendered offscreen (`position: fixed; top: -99999`), so the visible map is never resized or disrupted.

When `getImageData(paperSize)` is called on the `GenericMapControls` ref:

1. `activePaperSize` state is set, which sizes the offscreen canvas to `canvas.width × 2` by `canvas.height × 2` for the chosen paper size.
2. `makeScreenshotLayers("print-a3" | "print-a4")` produces layers with thicker strokes to compensate for the canvas-to-image upscaling.
3. `onAfterRender` polls `layer.isLoaded` — once all layers are ready, `getMapImageData` is called.
4. `getMapImageData` scales the canvas up to fill the image dimensions, composites the legend (via `html2canvas`), and returns a `blob:` URL.

## Print render modes

`MapRenderMode` has three values: `"screen"`, `"print-a3"`, `"print-a4"`. The print modes apply a pixel scale factor in `getStyles` to keep line widths visually consistent at output resolution (A3 = ×3, A4 = ×2).
