import { Components } from "@mui/material";

import { Icon } from "src/icons";

import { palette } from "./palette";
import { typography } from "./typography";

export const components: Components = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      // @ts-expect-error - MUI types are not up to date
      root: {
        textTransform: "none !important",

        "& .MuiButton-startIcon": {
          marginRight: 4,
        },

        "& .MuiButton-endIcon": {
          marginLeft: 4,
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      variant: "contained",
      color: "secondary",
      size: "md",
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return { padding: "10px 16px", ...typography.body3 };
            case "md":
              return { padding: "10px 20px", ...typography.body2 };
            case "lg":
              return { padding: "10px 20px", ...typography.body1 };
            case "xl":
              return { padding: "10px 20px", ...typography.h3 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        const variant = ownerState.variant ?? "contained";
        const color =
          ownerState.color === "inherit"
            ? "inherit"
            : palette[ownerState.color ?? "primary"];

        const variantColorStyles = (() => {
          if (!color) {
            return {};
          }

          if (color === "inherit") {
            return {
              color: "inherit",
            };
          }

          switch (variant) {
            case "contained":
              return {
                backgroundColor: color.main,
                color: color.light,

                "&:hover": {
                  backgroundColor: color.dark,
                },
                "&.Mui-disabled": {
                  color: color.light,
                  backgroundColor: palette.secondary[200],
                },
              };
            case "outlined":
              return {
                color: color.main,
                borderColor: color.main,

                "&:hover": {
                  borderColor: color.dark,
                  color: color.dark,
                  backgroundColor: "transparent",
                },
                "&.Mui-disabled": {
                  borderColor: palette.secondary[200],
                  color: palette.secondary[200],
                },
              };
            case "text":
              return {
                color: color.main,

                "&:hover": {
                  backgroundColor: "transparent",
                  color: color.dark,
                },
                "&.Mui-disabled": {
                  color: palette.secondary[200],
                },
              };
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
          ...variantColorStyles,
        };
      },
    },
  },
  MuiIconButton: {
    defaultProps: {
      variant: "contained",
      color: "secondary",
      size: "md",
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const size = ownerState.size ?? "md";
        const color =
          ownerState.color === "inherit"
            ? "inherit"
            : palette[ownerState.color ?? "primary"];

        const variant = ownerState.variant ?? "contained";

        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return {
                padding: "10px",
                ...typography.body3,
              };
            case "md":
              return {
                padding: "11px",
                ...typography.body2,
              };
            case "lg":
              return {
                padding: "12px",
                ...typography.body1,
              };
            case "xl":
              return {
                padding: "14px",
                ...typography.h3,
              };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        const variantColorStyles = (() => {
          if (!color || color === "inherit") return { color: "inherit" };

          switch (variant) {
            case "contained":
              return {
                backgroundColor: color.main,
                color: color.light,
                "&:hover": {
                  backgroundColor: color.dark,
                },
                "&.Mui-disabled": {
                  backgroundColor: palette.secondary[200],
                  color: color.light,
                },
              };
            case "outlined":
              return {
                color: color.main,
                border: `1px solid ${color.main}`,
                "&:hover": {
                  color: color.dark,
                  backgroundColor: "transparent",
                  borderColor: color.dark,
                },
                "&.Mui-disabled": {
                  borderColor: palette.secondary[200],
                  color: palette.secondary[200],
                },
              };
            case "text":
              return {
                color: color.main,
                "&:hover": {
                  backgroundColor: "transparent",
                  color: color.dark,
                },
                "&.Mui-disabled": {
                  color: palette.secondary[200],
                },
              };
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
          ...variantColorStyles,
          borderRadius: 2,
        };
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: `1px solid`,
        backgroundColor: "background", // supposed to be background.paper investigate why only background works
        color: "text.primary",
        borderRadius: 0.5,
        height: 44,
        borderColor: "monochrome.500",
        "& input::placeholder": {
          color: "text.500",
        },

        "& .MuiAutocomplete-endAdornment": {
          borderLeft: "1px solid",
          borderColor: "monochrome.500",
          marginLeft: "4px",
          paddingLeft: "4px",
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },

        "& fieldset": {
          display: "none",
        },
      },
    },
  },

  MuiNativeSelect: {
    defaultProps: {
      IconComponent: ({ style, ...rest }) => {
        return (
          <Icon
            name="chevrondown"
            style={{
              ...style,
              cursor: "pointer",
              color: "white",
            }}
            {...rest}
          />
        );
      },
    },
    styleOverrides: {
      select: {
        transition: "color 0.2s ease",
      },
      icon: {
        top: "calc(50% - 12px)",
        right: 0,
        color: "inherit !important",
        transition: "color 0.2s ease !important",
      },
    },
  },
  MuiLink: {
    defaultProps: {
      size: "md",
      underline: "none",
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const isPrimary = ownerState.color === "primary";

        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return typography.body3;
            case "md":
              return typography.body2;
            case "lg":
              return typography.body1;
            case "xl":
              return typography.h3;
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
          minWidth: 0,
          textDecoration: isPrimary ? "underline" : "none",
        };
      },
    },
  },

  MuiTypography: {
    styleOverrides: {
      root: {
        fontWeight: 400,
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: `
        html {
          margin: 0;
          padding: 0;
          font-family: "NotoSans";
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        * {
          line-height: 1;
        }

        fieldset {
          border: none;
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 300;
          src: url("/static/fonts/NotoSans-Light.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 300;
          src: url("/static/fonts/NotoSans-LightItalic.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 400;
          src: url("/static/fonts/NotoSans-Regular.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 400;
          src: url("/static/fonts/NotoSans-Italic.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 700;
          src: url("/static/fonts/NotoSans-Bold.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 700;
          src: url("/static/fonts/NotoSans-BoldItalic.woff2") format("woff2");
        }
        `,
  },
};
