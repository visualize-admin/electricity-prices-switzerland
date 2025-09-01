import { Trans } from "@lingui/macro";
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

import { TooltipMultiple } from "src/components/charts-generic/interaction/tooltip-content";
import { ListItemType } from "src/components/list";
import useVaulStyles from "src/components/useVaulStyles";
import { Entity } from "src/domain/data";
import {
  useQueryStateEnergyPricesMap,
  useQueryStateMapCommon,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
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
  const [tab, setTab] = useState("selectors");
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
      <Vaul.Root open={open} onClose={onClose}>
        <Vaul.Portal>
          <Vaul.Overlay className={classes.overlay} />
          <Vaul.Content className={classes.content} ref={vaultContentRef}>
            {/* Tabs that can select between list & selectors */}
            <IconButton
              onClick={onClose}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              <Icon name="close" />
            </IconButton>

            <div className={classes.handle} />
            <Box
              sx={{ overflowY: "auto", overflowX: "hidden", flex: 1, mx: 2 }}
            >
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
                      <Tab label="Selectors" value="selectors" />
                      <Tab label="List" value="list" />
                    </Tabs>
                  </Box>
                  <Box mx={tab === "selectors" ? -4 : 1}>
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
            </Box>
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
  selectedItem,
  listButtonGroup,
  colorScale,
}: {
  list: React.ReactNode;
  listButtonGroup: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  selectedItem?: ListItemType | null;
  entity?: Entity;
  colorScale: (value: number) => string;
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
  const selectedItemStatus = selectedItem
    ? `${selectedItem.label}, ${selectedItem.value}`
    : "No selection";
  const status = selectedItem
    ? selectedItemStatus
    : tab == "electricity"
    ? pricesCurrentStatus
    : sunshineCurrentStatus;

  return (
    <>
      <Box position="relative" sx={{ height: 0 }}>
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
          onClick={() => setDrawerOpen(true)}
        >
          <CardContent sx={{ pb: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {selectedItem && selectedItem.label ? (
                <TooltipMultiple
                  xValue={selectedItem.label}
                  segmentValues={
                    /*
                  type SegmentValue = {
                    label?: string;
                    value: string;
                    color?: string;
                    yPos?: number;
                    symbol?: LegendSymbol;
                  }

                  type SelectedItem = {
                    id: string;
                    label?: string | null;
                    value: number;
                    canton?: string | null;
                    cantonLabel?: string | null;
                    operators?:
                      | {
                          id: string;
                          label?: string | null;
                          value: number;
                        }[]
                      | null;
                    */

                    // map over selectedItem.operators
                    selectedItem.operators
                      ? selectedItem.operators.map((operator) => ({
                          label: operator.label ?? undefined,
                          value: operator.value.toString(),
                          color: colorScale(operator.value),
                        }))
                      : []
                  }
                />
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
