import { Components, Theme } from "@mui/material";

import { Icon } from "src/icons";
import { IconChevronDown } from "src/icons/ic-chevron-down";

import { palette } from "./palette";
import { shadows } from "./shadows";
import { typography } from "./typography";

const NativeSelectIcon = (props: $IntentionalAny) => {
  // we need to display the icon inside a container to be able to put
  // the 24x24 icon into a 40x42 container
  return (
    <div {...props}>
      <IconChevronDown />
    </div>
  );
};

export const components = (theme: Theme): Components => ({
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: palette.background.paper,
        ...typography.caption,
        borderRadius: 2, // sm border radius
        boxShadow: shadows[4],
        color: palette.text.primary,
      },
      arrow: {
        color: palette.background.paper,
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          padding: "0px 8px",
        },
        "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
          padding: "0px 8px",
        },
        "& .MuiAutocomplete-popupIndicator": {
          width: "auto",
          height: "auto",
        },
      },
      popper: {
        zIndex: 1300,
      },
      paper: {
        boxShadow: shadows[3],
        borderRadius: 2,
        backgroundColor: palette.background.paper,
        minWidth: "calc(100% + 8px)",
        marginLeft: "-4px",
      },
      listbox: {
        "& .MuiAutocomplete-groupLabel": {
          ...typography.h6,
          fontWeight: 400,
          color: palette.text[500],
          padding: "10px 16px",
          borderBottom: `1px solid ${palette.monochrome[300]}`,
          margin: 0,
        },
        "& .MuiAutocomplete-groupUl": {
          padding: 0,
          "&:not(:last-child)": {
            borderBottom: `1px solid ${palette.monochrome[200]}`,
          },
        },
        fontSize: "14px",
        overflowY: "auto",

        padding: 0,
        "& .MuiAutocomplete-option": {
          padding: "10px 16px",
          ...typography.h6,
          color: palette.text.primary,
          "&:hover": {
            backgroundColor: palette.secondary[50],
          },

          "&[aria-selected='true']": {
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: palette.secondary[50],
            },
            "&.Mui-focused": {
              backgroundColor: "transparent",
            },
          },
          "&.Mui-disabled": {
            color: palette.secondary[200],
          },
        },
      },
    },
  },
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
  MuiNativeSelect: {
    defaultProps: {
      IconComponent: NativeSelectIcon,
      disableUnderline: true,
    },
    styleOverrides: {
      root: {
        "&:before": {
          display: "none",
        },
      },
      icon: {
        width: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 42,
        top: 0,
        padding: 8,
        pointerEvents: "none",
        color: palette.text.primary,
        borderLeft: "1px solid",
        borderLeftColor: palette.text.primary,
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
              return {
                padding: "10px 16px",
                ...typography.body3,
                "& .MuiButton-icon": {
                  transform: "scale(0.83)",
                  marginTop: -4,
                  marginBottom: -4,
                },
              };
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
          borderRadius: 2,
        };
      },
    },
  },
  MuiIconButton: {
    defaultProps: {
      variant: "text",
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
                width: "40px",
                height: "40px",
                ...typography.body3,

                // icon size 20
                "& svg": {
                  margin: -2,
                },
              };
            case "md":
              return {
                width: "44px",
                height: "44px",
                ...typography.body2,

                // icon size 22
                "& svg": {
                  marginTop: -1,
                },
              };
            case "lg":
              return {
                width: "48px",
                height: "48px",
                ...typography.body1,
              };
            case "xl":
              return {
                width: "52px",
                height: "52px",
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
      sizeSmall: {
        minHeight: "40px",
        fontSize: "14px",
      },
      root: {
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: `1px solid`,
        backgroundColor: palette.background.paper,
        color: palette.text.primary,
        paddingLeft: "16px",
        borderRadius: "2px",
        height: "100%",
        borderColor: palette.monochrome[500],

        "& input::placeholder": {
          color: palette.text[500],
        },

        "&.Mui-error": {
          borderColor: palette.error.main,
          color: palette.error.main,

          "& .MuiAutocomplete-endAdornment": {
            borderColor: palette.error.main,

            "& button svg": {
              color: palette.error.main,
            },
          },
        },

        "&.Mui-disabled": {
          opacity: 1,
          color: palette.secondary[200],
          borderColor: palette.secondary[200],
          "& .MuiAutocomplete-endAdornment": {
            borderColor: palette.secondary[200],
            "& button svg": {
              color: palette.secondary[200],
            },
          },
        },

        "& .MuiAutocomplete-endAdornment": {
          borderLeft: "1px solid",
          borderColor: palette.monochrome[500],
          marginLeft: "4px",
          paddingLeft: "4px",
          minHeight: "40px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& button": {
            background: "none",
            boxShadow: "none",
            border: "none",
          },
        },

        "& fieldset": {
          display: "none",
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      sizeSmall: {
        [theme.breakpoints.up("sm")]: {
          fontSize: "14px",
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 2,
        [theme.breakpoints.up("sm")]: {
          fontSize: "16px",
        },
      },
      sizeSmall: {
        [theme.breakpoints.up("sm")]: {
          fontSize: "14px",
        },
      },
    },
  },
  MuiAccordion: {
    defaultProps: {
      disableGutters: true,
    },
    styleOverrides: {
      root: () => {
        //FIXME: size prop override currently doesn't work for Accordion component

        // const size = ownerState.size ?? "md";
        // const sizeStyles = (() => {
        //   switch (size) {
        //     case "md":
        //       return {
        //         ".MuiAccordionSummary-root": {
        //           padding: "12px 4px",
        //           ...typography.h5,
        //         },
        //         ".MuiCollapse-root": {
        //           ...typography.body2,
        //         },
        //       };

        //     case "xl":
        //       return {
        //         ".MuiAccordionSummary-root": {
        //           padding: "12px 20px",
        //           ...typography.h3,
        //         },
        //         ".MuiCollapse-root": {
        //           ...typography.body1,
        //         },
        //       };
        //     default:
        //       const _exhaustiveCheck: never = size;
        //       return _exhaustiveCheck;
        //   }
        // })();

        return {
          // ...sizeStyles,

          ".MuiCollapse-root": {
            ...typography.body2,
          },
          borderTop: `1px solid ${palette.monochrome[200]}`,
          "&.Mui-expanded": {
            margin: 0,
            borderTop: `1px solid ${palette.monochrome[200]}`,
          },
          ".MuiAccordionSummary-root": {
            padding: "12px 4px",
            ...typography.h5,
            mb: 2,
            color: palette.tertiary.main,
            "&:hover": {
              color: palette.tertiary.dark,
            },
            fontWeight: 700,
          },
          ".MuiAccordionDetails-root": {
            padding: "0px 12px 40px 12px",
          },
        };
      },
    },
  },
  MuiAccordionSummary: {
    defaultProps: {
      expandIcon: <Icon name="chevrondown" />,
    },
  },
  MuiChip: {
    defaultProps: {
      size: "md",
      deleteIcon: <Icon name="cancel" strokeWidth={"3px"} />,
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "xs":
              return { padding: "4px 8px", ...typography.caption };
            case "sm":
              return { padding: "4px 12px", ...typography.body3 };
            case "md":
              return { padding: "4px 12px", ...typography.body2 };
            case "lg":
              return { padding: "4px 16px", ...typography.body1 };
            case "xl":
              return { padding: "4px 16px", ...typography.h3 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
          width: "fit-content",
          height: "fit-content",
          color: palette.text.primary,
          cursor: "pointer",
          backgroundColor: palette.secondary[50],
          "&:hover": {
            backgroundColor: palette.secondary[100],
          },
          "&.Mui-disabled": {
            opacity: 1,
            backgroundColor: palette.secondary[50],
            border: `1px solid ${palette.secondary[100]}`,
            color: palette.secondary[200],
            "& .MuiChip-deleteIcon": {
              color: palette.secondary[200],
            },
          },
        };
      },
      label: {
        padding: 0,
        lineHeight: "inherit",
      },
      deleteIcon: ({ ownerState }) => {
        const sizeStyles = (() => {
          switch (ownerState.size) {
            case "xs":
              return { width: 16, height: 16 };
            case "sm":
            case "md":
            case "lg":
            case "xl":
              return { width: 24, height: 24 };
            default:
              return {};
          }
        })();

        return {
          ...sizeStyles,
          color: palette.text.primary,
          marginRight: 0,
          marginLeft: "4px",
        };
      },
    },
  },

  MuiInput: {},
  MuiLink: {
    defaultProps: {
      size: "md",
      underline: "none",
    },
    styleOverrides: {
      root: ({ ownerState }) => {
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

  
        fieldset {
          border: none;
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 300;
          src: url("/fonts/NotoSans-Light.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 300;
          src: url("/fonts/NotoSans-LightItalic.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 400;
          src: url("/fonts/NotoSans-Regular.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 400;
          src: url("/fonts/NotoSans-Italic.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 700;
          src: url("/fonts/NotoSans-Bold.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 700;
          src: url("/fonts/NotoSans-BoldItalic.woff2") format("woff2");
        }
        `,
  },
});
