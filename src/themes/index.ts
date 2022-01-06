import { Theme as ThemeUITheme, useThemeUI } from "theme-ui";

/**
 * Adapted/refined from the [Theme UI Theme Specification](https://theme-ui.com/theme-spec)
 *
 * TODO: Types are still a bit wonky because the base types are not the greatest
 */
export type Theme = Omit<ThemeUITheme, "colors" | "shadows" | "fonts"> & {
  palettes: {
    diverging: string[];
    categorical: string[];
  };
  colors: Record<string, string>;
  shadows: Record<string, string>;
  fonts: {
    body: string;
    monospace: string;
  };
};

interface ThemeModule {
  theme: Theme;
  preloadFonts?: string[];
}

export const loadTheme = async (theme: string = "federal") => {
  let themeModule: ThemeModule;
  try {
    themeModule = await import(`../themes/${theme}`);
  } catch (e) {
    // If there's an error, the theme was probably not found
    console.warn(`Theme '${theme}' not found. Using 'elcom' theme`);
    themeModule = await import("../themes/elcom");
  }
  return themeModule;
};

export const useTheme = () => useThemeUI().theme as unknown as Theme;
