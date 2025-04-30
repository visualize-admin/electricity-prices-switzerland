import { Components } from "@mui/material";

import { Icon } from "src/icons";

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
        backgroundColor: "background",
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
