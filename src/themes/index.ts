import { SystemStyleObject } from "@styled-system/css";
import { useThemeUI, Theme as ThemeUITheme } from "theme-ui";

/**
 * Adapted/refined from the [Theme UI Theme Specification](https://theme-ui.com/theme-spec)
 *
 * TODO: Types are still a bit wonky because the base types are not the greatest
 */
export type Theme = Omit<
  ThemeUITheme,
  "colors" | "buttons" | "links" | "fontSizes" | "lineHeights" | "fonts"
> &
  Required<Pick<ThemeUITheme, "space" | "breakpoints">> & {
    fontSizes: Array<string | number>;
    lineHeights: Array<string | number>;
    fonts: {
      body: string;
      monospace: string;
    };
    colors: Record<string, string>;
    palettes: {
      diverging: string[];
      categorical: string[];
    };
    text: SystemStyleObject;
    buttons: SystemStyleObject;
    styles?: SystemStyleObject;
    shadows?: Record<string, string>;
    links?: SystemStyleObject;
    variants?: SystemStyleObject;
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
