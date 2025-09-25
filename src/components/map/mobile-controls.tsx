import { t, Trans } from "@lingui/macro";
import {
  alpha,
  Box,
  Card,
  CardContent,
  createTheme,
  IconButton,
  Tab,
  Tabs,
  Theme,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import * as Vaul from "vaul";

import { useMap } from "src/components/map-context";
import { SelectedEntityCard } from "src/components/map-tooltip";
import useVaulStyles from "src/components/use-vaul-styles";
import { Entity } from "src/domain/data";
import {
  useQueryStateEnergyPricesMap,
  useQueryStateMapCommon,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import { useSelectedEntityData } from "src/hooks/use-selected-entity-data";
import { Icon } from "src/icons";

const MobileDrawer = ({
  list,
  listButtonGroup,
  details,
  selectors,
  onClose,
  open,
}: {
  list: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  listButtonGroup: React.ReactNode;
  onClose?: () => void;
  open: boolean;
}) => {
  const { classes } = useVaulStyles();
  const [tab, setTab] = useState<"list" | "parameters">("parameters");
  const vaultContentRef = useRef<HTMLDivElement>(null);
  const [queryState] = useQueryStateMapCommon();
  return (
    <ThemeProvider
      theme={(theme: Theme) =>
        createTheme({
          ...theme,
          components: {
            ...theme.components,
            MuiPopper: {
              defaultProps: {
                container: () => vaultContentRef.current,
              },
            },
          },
        })
      }
    >
      <Vaul.Root open={open} onClose={onClose} repositionInputs={false}>
        <Vaul.Portal>
          <Vaul.Overlay className={classes.overlay} />
          <Vaul.Content
            className={`${classes.content} ${
              tab === "list" ? classes.contentFullHeight : ""
            }`}
            ref={vaultContentRef}
          >
            {/* Tabs that can select between list & selectors */}

            <div className={classes.handle} />
            <div className={classes.scrollArea}>
              <IconButton onClick={onClose} className={classes.closeButton}>
                <Icon name="close" />
              </IconButton>
              {details ? (
                details
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >
                    <Tabs
                      value={tab}
                      sx={{ mb: 6 }}
                      onChange={(event, newValue) => setTab(newValue)}
                    >
                      <Tab
                        label={t({
                          id: "mobile-controls.tabs.parameters",
                          message: "Parameters",
                        })}
                        value="parameters"
                      />
                      <Tab
                        label={t({
                          id: "mobile-controls.tabs.list",
                          message: "List",
                        })}
                        value="list"
                      />
                    </Tabs>
                  </Box>
                  <Box mx={2}>
                    {tab === "list" ? (
                      <Box display="flex" flexDirection="column" gap={2}>
                        {/* Only show the list button group on the electricity tab */}
                        {queryState.tab === "electricity"
                          ? listButtonGroup
                          : null}
                        {list}
                      </Box>
                    ) : (
                      selectors
                    )}
                  </Box>
                </>
              )}
            </div>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    </ThemeProvider>
  );
};

const MobileControls = ({
  list,
  details,
  selectors,
  selectedEntityData,
  listButtonGroup,
}: {
  list: React.ReactNode;
  listButtonGroup: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  selectedEntityData?: ReturnType<typeof useSelectedEntityData> | null;
  entity?: Entity;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [queryState] = useQueryStateMapCommon();
  const [energyQueryState] = useQueryStateEnergyPricesMap();
  const [sunshineQueryState] = useQueryStateSunshineMap();

  const tab = queryState.tab;

  // Extract current values with defaults
  const period = energyQueryState.period || "2020";
  const priceComponent = energyQueryState.priceComponent || "total";
  const category = energyQueryState.category || "H4";
  const product = energyQueryState.product || "standard";

  // sunshine
  const sunshinePeriod = sunshineQueryState.period || "2020";
  const sunshinePeerGroup = sunshineQueryState.peerGroup || "total";
  const sunshineIndicator = sunshineQueryState.indicator || "H4";
  const sunshineNetworkLevel = sunshineQueryState.networkLevel || "standard";

  // Get localized labels for display
  const priceComponentLabel = getLocalizedLabel({ id: priceComponent });
  const categoryLabel = getLocalizedLabel({ id: category });
  const productLabel = getLocalizedLabel({ id: product });

  // Format the current status string
  const pricesCurrentStatus = `${period}, ${priceComponentLabel}, ${categoryLabel}, ${productLabel}`;
  const sunshineCurrentStatus = `${sunshinePeriod}, ${sunshineIndicator}, ${sunshinePeerGroup}, ${sunshineNetworkLevel}`;
  const selectedItemStatus = selectedEntityData?.entityId
    ? `${selectedEntityData.formattedData?.title}, ${selectedEntityData.formattedData?.title}`
    : "No selection";
  const status = selectedEntityData?.entityId
    ? selectedItemStatus
    : tab == "electricity"
    ? pricesCurrentStatus
    : sunshineCurrentStatus;

  const { setActiveId } = useMap();

  return (
    <>
      <Box
        position="relative"
        sx={{
          height: 0,
          // Necessary to be above No Data UI
          zIndex: 1,
        }}
      >
        <Card
          elevation={2}
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "22px",
            right: "22px",
            margin: "auto",
            transition: "background-color 0.3s ease",
            cursor: "pointer",
            backdropFilter: (theme) => `blur(${theme.spacing(1)})`,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.8),
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.background.paper, 0.95),
            },
          }}
          onClick={(ev) => {
            if (ev.defaultPrevented) {
              return;
            }
            return setDrawerOpen(true);
          }}
        >
          {selectedEntityData?.entityId ? (
            <IconButton
              sx={{ position: "absolute", top: "0.25rem", right: "0.25rem" }}
              onClick={(ev) => {
                ev.preventDefault();
                return setActiveId(null);
              }}
            >
              <Icon name="close" />
            </IconButton>
          ) : null}
          <CardContent sx={{ pb: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {selectedEntityData?.formattedData ? (
                <Box
                  style={{ flex: 1, maxHeight: "120px", overflow: "scroll" }}
                >
                  <SelectedEntityCard {...selectedEntityData.formattedData} />
                </Box>
              ) : (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    <Trans id="selector.legend.select.parameters">
                      Parameter auswählen
                    </Trans>
                  </Typography>
                  <Typography variant="body2">{status}</Typography>
                </Box>
              )}
              <IconButton edge="end" aria-label="edit parameters">
                <Icon name="menu" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <MobileDrawer
        list={list}
        listButtonGroup={listButtonGroup}
        selectors={selectors}
        details={details}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

export default MobileControls;
