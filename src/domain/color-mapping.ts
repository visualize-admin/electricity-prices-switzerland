import { getPalette } from "src/domain/helpers";

export type ColorMapping = Record<string, string> | undefined;

interface ColorMappingItem {
  id: string;
  name?: string;
}

/**
 * Creates a consistent color mapping for items based on compareWith selection and palette.
 * This ensures that AllOrMultiCombobox and chart components use the same colors for the same items.
 *
 * @param compareWith - Array of selected item IDs from the compare selector
 * @param paletteName - Name of the palette to use (e.g., "elcom2", "monochrome")
 * @returns Color mapping object where keys are item IDs and values are hex colors, or undefined for "select all" mode
 */
export const createColorMapping = (
  compareWith: string[] | undefined,
  paletteName: string
): ColorMapping => {
  // If "select all" is selected, return undefined to use default/monochrome styling
  if (compareWith?.includes("sunshine.select-all")) {
    return undefined;
  }

  // If no items are selected or no palette specified, return undefined
  if (!compareWith?.length || !paletteName) {
    return undefined;
  }

  // Get the color palette
  const palette = getPalette(paletteName);

  if (!palette.length) {
    return undefined;
  }

  // Create a mapping of item IDs to colors
  const colorMapping: Record<string, string> = {};

  // Filter to only items that are actually selected (excluding "sunshine.select-all")
  const selectedItemIds = compareWith.filter(
    (id) => id !== "sunshine.select-all"
  );

  // Map each selected item to a color, cycling through the palette if needed
  selectedItemIds.forEach((itemId, index) => {
    const colorIndex = index % palette.length;
    colorMapping[itemId] = palette[colorIndex];
  });

  return colorMapping;
};

/**
 * Gets the color for a specific item from a color mapping.
 *
 * @param itemId - The ID of the item to get the color for
 * @param colorMapping - The color mapping object
 * @returns The color string or undefined if not found
 */
const _getColorForItem = (
  itemId: string,
  colorMapping: ColorMapping
): string | undefined => {
  return colorMapping?.[itemId];
};

/**
 * Converts a color mapping to an array format suitable for the legacy colorful prop.
 * This is a temporary compatibility function during the migration.
 *
 * @param colorMapping - The color mapping object
 * @param selectedItems - Array of selected item IDs in order
 * @returns Array of colors corresponding to the selected items order
 */
const _colorMappingToArray = (
  colorMapping: ColorMapping,
  selectedItems: string[]
): string[] | undefined => {
  if (!colorMapping) {
    return undefined;
  }

  return selectedItems
    .map((itemId) => colorMapping[itemId])
    .filter((color): color is string => color !== undefined);
};
