import { Components } from "@mui/material";

import { Icon } from "src/icons";

import { palette } from "./palette";
import { shadows } from "./shadows";
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
              return { padding: "10px 16px", ...typography.h6 };
            case "md":
              return { padding: "10px 20px", ...typography.h5 };
            case "lg":
              return { padding: "10px 20px", ...typography.h4 };
            case "xl":
              return { padding: "10px 20px", ...typography.h3 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
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
        backgroundColor: "#fff",
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
  MuiInput: {
    defaultProps: {
      size: "md",
      disableUnderline: true,
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return { padding: "10px 16px", ...typography.h6 };
            case "md":
              return { padding: "10px 16px", ...typography.h5 };
            case "lg":
              return { padding: "10px 16px", ...typography.h4 };
            case "xl":
              return { padding: "12px 16px", ...typography.h4 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return sizeStyles;
      },
      input: {
        padding: 0,
        paddingRight: 12,
        "&.Mui-disabled": {
          WebkitTextFillColor: palette.monochrome[300],
        },

        "&::placeholder": {
          opacity: 1,
        },
      },
    },
  },
  MuiNativeSelect: {
    defaultProps: {
      IconComponent: ({ style, ...rest }: any) => {
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
  MuiSelect: {
    defaultProps: {
      size: "md",
      notched: false,
      MenuProps: {
        disablePortal: true,
      },
      IconComponent: ({ style, ...rest }: any) => {
        return (
          <Icon
            name="chevrondown"
            style={{
              ...style,
              cursor: "pointer",
              color: palette.monochrome[800],
              transition: "transform 0.2s ease",
            }}
            {...rest}
          />
        );
      },
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const variant = ownerState.variant ?? "outlined";
        const variantStyles = (() => {
          switch (variant) {
            case "outlined":
              return {};
            case "filled":
              return {};
            case "standard": {
              return {
                backgroundColor: "transparent",

                "&.Mui-focused": {
                  backgroundColor: `none !important`,
                },
              };
            }
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return { ...typography.h6 };
            case "md":
              return { ...typography.h5 };
            case "lg":
              return { ...typography.h4 };
            case "xl":
              return { ...typography.h4 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return {
          cursor: "pointer",
          width: "fit-content",
          padding: 0,
          border: "none !important",
          ...variantStyles,

          "& fieldset": {
            display: "none",
          },

          "& .MuiSelect-select": {
            ...sizeStyles,
          },

          "&.Mui-disabled": {
            color: `${palette.monochrome[300]} !important`,
          },

          "& .MuiList-root": {
            width: "auto",
            padding: "4px 0",
            boxShadow: shadows[3],

            "& .MuiMenuItem-root": {
              ...sizeStyles,
            },
          },
        };
      },
      select: ({ ownerState }) => {
        const variant = ownerState.variant ?? "outlined";
        const variantStyles = (() => {
          switch (variant) {
            case "outlined":
              return {
                padding: "10px 40px 10px 20px !important",
                border: `1px solid ${palette.monochrome[300]}`,

                "&:hover, &[aria-expanded='true']": {
                  border: `1px solid ${palette.monochrome[500]}`,
                  backgroundColor: palette.cobalt[50],
                },
              };
            case "filled":
              return {
                padding: "10px 40px 10px 20px !important",
              };
            case "standard": {
              return {
                padding: "4px 24px 4px 4px !important",

                "&:hover, &[aria-expanded='true']": {
                  backgroundColor: palette.cobalt[50],
                },
              };
            }
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...variantStyles,
          backgroundColor: "transparent",
          transition:
            "border 0.2s ease, background-color 0.2s ease, color 0.2s ease",
        };
      },
      icon: ({ ownerState }) => {
        const variant = ownerState.variant ?? "outlined";

        return {
          top: "calc(50% - 12px)",
          right: variant === "standard" ? 0 : 12,
          color: "inherit !important",
          transition: "color 0.2s ease, transform 0.2s ease !important",
        };
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: "none",
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
