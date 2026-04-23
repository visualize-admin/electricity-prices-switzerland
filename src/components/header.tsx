import { TopBar } from "@interactivethings/swiss-federal-ci/dist/components";
import {
  Header as SwissFederalCiHeader,
  MenuButton,
  MenuContainer,
} from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  NativeSelect,
  nativeSelectClasses,
  Popover,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { makeStyles } from "tss-react/mui";

import { SafeHydration } from "src/components/hydration";
import { Search } from "src/components/search";
import contentRoutes from "src/content-routes.json";
import { Icon } from "src/icons";
import { IconChevronDown } from "src/icons/ic-chevron-down";
import { useLocale } from "src/lib/use-locale";
import { useResizeObserver } from "src/lib/use-resize-observer";
import { locales } from "src/locales/config";
import { palette } from "src/themes/palette";
import { F, FlagList, useFlag } from "src/utils/flags";

const useHeaderStyles = makeStyles()(() => ({
  mobileDrawerMenuButton: {
    width: "100%",
    padding: "0 !important",
    marginLeft: "0 !important",
    "& .MuiButtonBase-root": {
      width: "calc(100% + 40px)",
      padding: "16px !important",
    },
    "& .MuiButtonBase-root.active": {
      borderBottom: "1px solid",
      borderColor: palette.monochrome[300],
    },
  },
}));

type LocaleSelectorProps = {
  alternates?: {
    [locale: string]: { title: string; path: string };
  };
};

const LocaleSelector = ({ alternates }: LocaleSelectorProps) => {
  const currentLocale = useLocale();
  const { push, pathname, query } = useRouter();

  return (
    <Box
      sx={{
        width: "fit-content",
        maxWidth: "100%",
        flexShrink: 0,
        alignSelf: "center",
      }}
    >
      <NativeSelect
        disableUnderline
        data-testid="locale-select"
        value={currentLocale}
        onChange={(e) => {
          const locale = e.currentTarget.value;
          const alternate = alternates?.[locale];

          if (alternate) {
            push(alternate.path, undefined, { locale: false });
          } else {
            push({ pathname, query }, undefined, { locale });
          }
        }}
        IconComponent={IconChevronDown}
        sx={{
          padding: 0,
          border: "none !important",
          backgroundColor: "transparent",
          color: "white !important",
          paddingRight: `0.75rem`,
          width: "fit-content",
          minWidth: "auto",

          [`.${nativeSelectClasses.icon}`]: {
            color: "white !important",
            border: 0,
            marginLeft: 0,
          },

          "&:hover": {
            textDecoration: "none !important",
            backgroundColor: "transparent",
            color: `${palette.secondary[100]} !important`,
          },
        }}
      >
        {locales
          .filter((locale) => locale !== "en")
          .map((locale) => (
            <option key={locale} value={locale}>
              {locale.toUpperCase()}
            </option>
          ))}
      </NativeSelect>
    </Box>
  );
};

const FlagMenu = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | undefined>(
    undefined
  );
  const isEnabled = useFlag(F.debug);
  if (!isEnabled) {
    return null;
  }

  return (
    <div>
      <Button
        sx={{ color: "white" }}
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        aria-label={t({
          id: "topbar.open-flag-menu",
          message: "Open flag menu",
        })}
      >
        Flags
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(undefined)}
      >
        <Box p={2}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Flags
          </Typography>
          <FlagList />
        </Box>
      </Popover>
    </div>
  );
};

export const Header = ({
  contentId,
  hideLogo,
  extendTopBar,
  showCaption = true,
}: {
  contentId?: string;
  hideLogo?: boolean;
  extendTopBar?: boolean;
  showCaption?: boolean;
}) => {
  const { classes } = useHeaderStyles();
  const [ref] = useResizeObserver<HTMLDivElement>();

  const alternates =
    contentId && contentId in contentRoutes
      ? (
          contentRoutes as {
            [k: string]: { [k: string]: { title: string; path: string } };
          }
        )[contentId]
      : undefined;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [focusSearchOnOpen, setFocusSearchOnOpen] = useState(false);
  const drawerSearchInputRef = useRef<HTMLInputElement | null>(null);

  const openMobileNav = (opts?: { focusSearch?: boolean }) => {
    setFocusSearchOnOpen(opts?.focusSearch ?? false);
    setMobileNavOpen(true);
  };

  return (
    <div ref={ref} style={{ zIndex: 1 }}>
      <TopBar
        ContentWrapperProps={{
          sx: {
            justifyContent: "space-between",
            ...(extendTopBar
              ? { maxWidth: "100% !important", px: "16px !important" }
              : {}),
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          marginLeft="auto"
          sx={{ flexShrink: 0, minWidth: 0 }}
        >
          <SafeHydration>
            <FlagMenu />
          </SafeHydration>
          <LocaleSelector alternates={alternates} />
        </Box>
      </TopBar>
      {hideLogo ? null : (
        <Box sx={{ position: "relative" }}>
          <SwissFederalCiHeader
            // @ts-expect-error longTitle can be ReactNode
            longTitle={
              <Box
                width="100%"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                <Trans id="header.long-title">
                  Federal Electricity Commission ElCom
                </Trans>
                {showCaption ? (
                  <>
                    <br />
                    <Typography fontWeight="normal" variant="inherit">
                      <Trans id="site.title">
                        Electricity tariffs in Switzerland
                      </Trans>
                    </Typography>
                  </>
                ) : null}
              </Box>
            }
            // @ts-expect-error shortTitle can be ReactNode
            shortTitle={
              <Box
                width="100%"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                <Trans id="header.short-title">ElCom</Trans>
                {showCaption ? (
                  <>
                    <br />
                    <Typography fontWeight="normal" variant="inherit">
                      <Trans id="site.title">
                        Electricity tariffs in Switzerland
                      </Trans>
                    </Typography>
                  </>
                ) : null}
              </Box>
            }
            rootHref="/"
            sx={{
              backgroundColor: "white",
              // Should be possible to target via HeaderProps but it's not yet available in swiss-federal-ci
              "& p": { maxWidth: "unset" },
              pr: { xs: "100px", md: 0 },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 0,
              height: "100%",
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              pr: "20px",
              gap: 0,
              zIndex: 2,
            }}
          >
            <IconButton
              onClick={() => openMobileNav({ focusSearch: true })}
              aria-label={t({
                id: "search.open",
                message: "Open search",
              })}
              size="lg"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 0.5,
              }}
            >
              <Icon name="search" />
            </IconButton>
            <IconButton
              onClick={() => openMobileNav({ focusSearch: false })}
              aria-label={t({
                id: "mobile-nav.open-menu",
                message: "Open menu",
              })}
              size="lg"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 0.5,
              }}
            >
              <Icon name="menu" />
            </IconButton>
          </Box>
          <Drawer
            anchor="right"
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            PaperProps={{
              "data-testid": "mobile-nav-drawer",
              sx: {
                width: "100%",
                maxWidth: "100%",
                borderLeft: "1px solid",
                borderColor: "monochrome.300",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: "100%",
              }}
            >
              <TopBar
                ContentWrapperProps={{
                  sx: {
                    justifyContent: "flex-end",
                  },
                }}
              >
                <LocaleSelector alternates={alternates} />
              </TopBar>

              <Box
                sx={{
                  position: "relative",
                  flexShrink: 0,
                  minHeight: 64,
                  bgcolor: "background.paper",
                  borderBottom: "1px solid ",
                  borderColor: "monochrome.300",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    minHeight: 40,
                    px: 4,
                    py: 3,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                    {mobileNavOpen ? (
                      <Search
                        key={focusSearchOnOpen ? "focus-search" : "no-focus"}
                        variant="drawer"
                        bareDrawerField
                        autoFocus={focusSearchOnOpen}
                        inputRef={drawerSearchInputRef}
                        onResultNavigate={() => setMobileNavOpen(false)}
                      />
                    ) : null}
                  </Box>
                  <IconButton
                    onClick={() => drawerSearchInputRef.current?.focus()}
                    aria-label={t({
                      id: "search.open",
                      message: "Open search",
                    })}
                    size="lg"
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: 0.5,
                    }}
                  >
                    <Icon name="search" />
                  </IconButton>
                  <IconButton
                    onClick={() => setMobileNavOpen(false)}
                    aria-label={t({
                      id: "mobile-nav.close-menu",
                      message: "Close menu",
                    })}
                    size="lg"
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: 0.5,
                    }}
                  >
                    <Icon name="close" />
                  </IconButton>
                </Box>
              </Box>

              <MenuContainer
                className="mobile-drawer-nav"
                ContentWrapperProps={{
                  sx: {
                    flexDirection: "column",
                    gap: "0px !important",
                  },
                }}
              >
                <MenuButton
                  title={<Trans id="home.menu.overview">Overview</Trans>}
                  href="/"
                  className={classes.mobileDrawerMenuButton}
                />
                <MenuButton
                  title={<Trans id="home.menu.map-view">Map view</Trans>}
                  href="/map"
                  className={classes.mobileDrawerMenuButton}
                />
              </MenuContainer>
            </Box>
          </Drawer>
        </Box>
      )}
    </div>
  );
};
