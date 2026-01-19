import { Trans } from "@lingui/macro";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  createTheme,
  IconButton,
  Theme,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { keyBy } from "lodash";
import React, { useRef } from "react";
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
import { usePeerGroupsQuery } from "src/graphql/queries";
import {
  SelectedEntityData,
  useSelectedEntityData,
} from "src/hooks/use-selected-entity-data";
import { Icon } from "src/icons";
import { useLocale } from "src/lib/use-locale";

const MobileDrawer = ({
  list,
  listButtonGroup,
  details,
  selectors,
  onClose,
  open,
  tab,
  selectedEntityData,
}: {
  list: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  listButtonGroup: React.ReactNode;
  onClose?: () => void;
  open: boolean;
  tab: "parameters" | "list";
  selectedEntityData?: SelectedEntityData | null;
}) => {
  const { classes } = useVaulStyles();
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
            <div className={classes.header}>
              <Typography variant="h5" component="div" fontWeight="bold">
                {tab === "list" ? (
                  <Trans id="mobile-drawer.list-title">Map View</Trans>
                ) : selectedEntityData ? (
                  <Trans id="mobile-drawer.details-title">Details</Trans>
                ) : (
                  <Trans id="mobile-drawer.parameters-title">Parameter</Trans>
                )}
              </Typography>
              <Button
                variant="text"
                onClick={onClose}
                color="primary"
                sx={{ pr: 0 }}
              >
                <Trans id="mobile-drawer.close">Close</Trans>
              </Button>
            </div>

            <div className={classes.scrollArea}>
              {details ? (
                details
              ) : (
                <>
                  <Box>
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
  drawerTab,
  drawerOpen,
  onCloseMobileDrawer,
  onClickCard,
}: {
  list: React.ReactNode;
  listButtonGroup: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  selectedEntityData?: ReturnType<typeof useSelectedEntityData> | null;
  entity?: Entity;
  drawerTab: "parameters" | "list";
  drawerOpen: boolean;
  onCloseMobileDrawer: () => void;
  onClickCard: () => void;
}) => {
  const [queryState] = useQueryStateMapCommon();
  const [energyQueryState] = useQueryStateEnergyPricesMap();
  const [sunshineQueryState] = useQueryStateSunshineMap();

  const tab = queryState.tab;
  const locale = useLocale();

  const [peerGroupsResult] = usePeerGroupsQuery({
    variables: { locale },
    requestPolicy: "cache-first",
  });
  const peerGroupsById = keyBy(
    peerGroupsResult.data?.peerGroups ?? [],
    (x) => x.id
  );

  // Extract current values with defaults
  const period = energyQueryState.period;
  const priceComponent = energyQueryState.priceComponent;
  const category = energyQueryState.category;
  const product = energyQueryState.product;

  // sunshine
  const sunshinePeriod = sunshineQueryState.period;
  const sunshinePeerGroup = sunshineQueryState.peerGroup;
  const sunshineIndicator = sunshineQueryState.indicator;
  const sunshineNetworkLevel = sunshineQueryState.networkLevel;

  // Get localized labels for display
  const priceComponentLabel = getLocalizedLabel({ id: priceComponent });
  const sunshineIndicatorLabel = getLocalizedLabel({ id: sunshineIndicator });
  const indicatorLabel =
    tab === "electricity" ? priceComponentLabel : sunshineIndicatorLabel;
  const sunshinePeerGroupLabel =
    sunshinePeerGroup === "all_grid_operators"
      ? getLocalizedLabel({ id: "peer-group.all-grid-operators" })
      : peerGroupsById[sunshinePeerGroup]?.name ?? sunshinePeerGroup;
  const sunshineNetworkLevelLabel = getLocalizedLabel({
    id: `network-level.${sunshineNetworkLevel}.short`,
  });
  const categoryLabel = getLocalizedLabel({ id: category });
  const productLabel = getLocalizedLabel({ id: product });

  // Format the current status string
  const pricesCurrentStatus = `${period}, ${categoryLabel}, ${productLabel}`;
  const sunshineCurrentStatus = `${sunshinePeriod}, ${sunshinePeerGroupLabel}, ${sunshineNetworkLevelLabel}`;
  const selectedItemStatus = selectedEntityData?.entityIds
    ? `${selectedEntityData.formattedData?.title}, ${selectedEntityData.formattedData?.title}`
    : "No selection";
  const status = selectedEntityData?.entityIds
    ? selectedItemStatus
    : tab === "electricity"
    ? pricesCurrentStatus
    : sunshineCurrentStatus;

  const { setActiveId } = useMap();

  return (
    <>
      <Box position="relative" height={0} zIndex={1}>
        <Card
          elevation={1}
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "22px",
            right: "22px",
            margin: "auto",
            transition: "background-color 0.3s ease",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.8),
          }}
          onClick={(ev) => {
            if (ev.defaultPrevented) {
              return;
            }
            onClickCard();
          }}
        >
          <CardContent sx={{ pb: "16px !important" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {selectedEntityData?.formattedData ? (
                <Box display="flex" flex={1} maxHeight="120px" gap={2}>
                  {selectedEntityData?.entityIds ? (
                    <IconButton
                      edge="start"
                      onClick={(ev) => {
                        ev.preventDefault();
                        return setActiveId(null);
                      }}
                    >
                      <Icon name="close" />
                    </IconButton>
                  ) : null}
                  <Box flex={1} flexDirection="column">
                    <SelectedEntityCard {...selectedEntityData.formattedData} />
                  </Box>
                  <IconButton edge="end" aria-label="edit parameters">
                    <Icon name="arrowright" />
                  </IconButton>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" flexGrow={1} gap={1}>
                  <Box width={32} flexShrink={0}>
                    <Icon name="filter" />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {indicatorLabel}
                    </Typography>
                    <Typography variant="body2">{status}</Typography>
                  </Box>
                </Box>
              )}
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
        onClose={onCloseMobileDrawer}
        tab={drawerTab}
        selectedEntityData={selectedEntityData}
      />
    </>
  );
};

export default MobileControls;
