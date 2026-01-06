import { Trans } from "@lingui/macro";
import { Button, Chip, Divider, Link, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { ScaleThreshold } from "d3";
import NextLink from "next/link";
import { ReactElement, ReactNode } from "react";

import { PriceEvolution } from "src/components/detail-page/price-evolution-line-chart";
import { indicatorToChart } from "src/components/map-details-chart-adapters";
import { Entity } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import {
  energyPricesDetailsLink,
  getSunshineDetailsPageFromIndicator,
  QueryStateEnergyPricesMap,
  QueryStateSunshineMap,
  sunshineDetailsLink,
  useQueryStateEnergyPricesMap,
  useQueryStateMapCommon,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import { Icon } from "src/icons";

import { ListItemType } from "./list";

type MapDetailsContentProps = {
  onBack: () => void;
  children: ReactNode;
};

const MapDetailsContentWrapper = (props: MapDetailsContentProps) => {
  const { onBack, children } = props;
  return (
    <Stack
      direction={"column"}
      spacing={4}
      padding={6}
      data-testid="map-details-content"
    >
      <div>
        <Button
          variant="text"
          startIcon={<Icon name="arrowleft" />}
          sx={{
            justifySelf: "flex-start",
            px: 1,
          }}
          color="tertiary"
          size={"md"}
          onClick={onBack}
        >
          <Trans id="map.details-sidebar-panel.back-button">
            Back to filters
          </Trans>
        </Button>
      </div>
      <Divider
        sx={{
          bgcolor: "secondary.50",
        }}
      />
      {children}
    </Stack>
  );
};

type MapDetailProps = ListItemType & { entity: Entity };

const MapDetailsEntityHeader = (props: MapDetailProps) => {
  const { entity, label, canton, cantonLabel } = props;
  const entityValue = getLocalizedLabel({
    id: entity.toLowerCase() as Lowercase<typeof entity>,
  });

  return (
    <Stack direction={"column"} spacing={2}>
      <Stack direction={"column"}>
        <Typography lineHeight={"140%"} variant="body3">
          {entityValue}
        </Typography>
        <Typography fontWeight={700} lineHeight={"160%"} variant="h3">
          {label}
        </Typography>
      </Stack>
      {entity !== "canton" && canton && cantonLabel && (
        <Typography variant="body3" color={"text.500"}>
          <Trans id="search.result.canton">Canton</Trans>:{" "}
          <Link
            href={`/canton/${canton}`}
            color={"primary"}
            size="sm"
            component={NextLink}
          >
            {cantonLabel}
          </Link>
        </Typography>
      )}
    </Stack>
  );
};

const entityTableRows: Record<Entity, EntityTableValue[]> = {
  operator: ["period", "priceComponent", "category", "product"],
  municipality: ["period", "priceComponent", "category", "product", "operator"],
  canton: ["period", "priceComponent", "category", "product"],
};

// Table rows configuration for sunshine indicators
const sunshineIndicatorTableRows: Record<
  string,
  Array<keyof QueryStateSunshineMap>
> = {
  networkCosts: ["period", "networkLevel"],
  netTariffs: ["period", "category"],
  energyTariffs: ["period", "category"],
  saidi: ["period", "saidiSaifiType"],
  saifi: ["period", "saidiSaifiType"],
  compliance: ["period", "complianceType"],
  outageInfo: ["period"],
  daysInAdvanceOutageNotification: ["period"],
};

const MapDetailsEntityTable = (
  props: MapDetailProps & { colorScale: ScaleThreshold<number, string> }
) => {
  const { entity, operators, colorScale } = props;
  const [{ tab }] = useQueryStateMapCommon();
  const [energyPricesQueryState] = useQueryStateEnergyPricesMap();
  const [sunshineQueryState] = useQueryStateSunshineMap();
  const formatNumber = useFormatCurrency();

  // Determine which table rows to show based on the current tab
  const tableRows =
    tab === "sunshine"
      ? sunshineIndicatorTableRows[sunshineQueryState.indicator] || []
      : entityTableRows[entity];

  const queryState =
    tab === "sunshine" ? sunshineQueryState : energyPricesQueryState;

  return (
    <Stack direction={"column"} spacing={2}>
      {tableRows.map((row, i) => {
        return (
          <KeyValueTableRow<typeof queryState> // Exclude 'operator' and 'period' for the table rows
            key={`${row}-${i}`}
            dataKey={row}
            state={
              {
                ...queryState,
                operator: operators?.length.toString(),
              } as typeof queryState
            }
          />
        );
      })}
      {operators?.map((operator, i) => {
        return (
          <KeyValueTableRow
            dataKey={operator.label ?? ""}
            component={NextLink}
            href={`/operator/${operator.id}`}
            key={`${operator.id}-${i}`}
            tag={
              <Chip
                size="sm"
                style={{ background: colorScale(operator.value) }}
                label={
                  <Typography variant="body3" color="black">
                    {formatNumber(operator.value)}
                  </Typography>
                }
              />
            }
          />
        );
      })}
    </Stack>
  );
};

type EntityTableValue = keyof QueryStateEnergyPricesMap;

const KeyValueTableRow = <
  T extends Partial<Record<EntityTableValue, string | undefined>>
>(props: {
  state?: T;
  dataKey: keyof T | string;
  component?: "span" | typeof NextLink;
  href?: string;
  tag?: ReactElement;
}) => {
  const { dataKey, state, component = "span", tag, href } = props;
  return (
    <Stack
      justifyContent={"space-between"}
      alignItems={"center"}
      direction={"row"}
      spacing={4}
    >
      <Typography
        href={href}
        component={component}
        color={component === "span" ? "text.500" : "primary"}
        sx={{
          textDecoration: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        variant="body3"
      >
        {state
          ? getLocalizedLabel({ id: dataKey.toString() as $IntentionalAny })
          : dataKey.toString()}
      </Typography>
      {tag ? (
        tag
      ) : (
        <Typography
          sx={{
            textTransform: "capitalize",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          variant="body3"
          fontWeight={700}
        >
          {state && dataKey in state
            ? (state[dataKey as keyof typeof state] as $IntentionalAny)
            : null}
        </Typography>
      )}
    </Stack>
  );
};

export const MapDetailsContent: React.FC<{
  colorScale: ScaleThreshold<number, string>;
  entity: Entity;
  selectedItem: ListItemType;
  onBack: () => void;
}> = ({ colorScale, entity, selectedItem, onBack }) => {
  const [{ tab }] = useQueryStateMapCommon();
  const [
    {
      period: energyPricesPeriod,
      priceComponent: energyPricesPriceComponent,
      category: energyPricesCategory,
      product: energyPricesProduct,
    },
  ] = useQueryStateEnergyPricesMap();
  const [{ indicator, period }] = useQueryStateSunshineMap();
  return (
    <MapDetailsContentWrapper onBack={onBack}>
      <MapDetailsEntityHeader entity={entity} {...selectedItem} />
      <MapDetailsEntityTable
        colorScale={colorScale}
        entity={entity}
        {...selectedItem}
      />
      <Divider />
      {tab === "electricity" ? (
        <PriceEvolution
          priceComponents={["total"]}
          id={selectedItem.id}
          entity={entity}
          mini
        />
      ) : (
        (() => {
          const Component = indicatorToChart[indicator];
          return Component ? (
            <Component period={period} selectedItem={selectedItem} />
          ) : null;
        })()
      )}
      <Button
        variant="contained"
        color="secondary"
        size="sm"
        sx={{
          justifyContent: "space-between",
        }}
        endIcon={<Icon name="arrowright" />}
        href={
          tab === "electricity"
            ? energyPricesDetailsLink(`/${entity}/${selectedItem.id}`, {
                period: [energyPricesPeriod],
                priceComponent: [
                  // Annual metering cost is shown as "metering rate" in details
                  energyPricesPriceComponent === "annualmeteringcost"
                    ? "meteringrate"
                    : energyPricesPriceComponent,
                ],
                category: [energyPricesCategory],
                product: [energyPricesProduct],
              })
            : sunshineDetailsLink(
                `/sunshine/operator/${
                  selectedItem.id
                }/${getSunshineDetailsPageFromIndicator(indicator)}`,
                {
                  tabDetails:
                    indicator === "daysInAdvanceOutageNotification"
                      ? "outageInfo"
                      : indicator,
                }
              )
        }
      >
        {(() => {
          if (tab === "electricity") {
            return (
              <Trans id="map.details-sidebar-panel.next-button.energy-prices">
                Energy Prices in detail
              </Trans>
            );
          }

          switch (indicator) {
            case "networkCosts":
              return (
                <Trans id="map.details-sidebar-panel.next-button.network-costs">
                  Network Costs in detail
                </Trans>
              );
            case "energyTariffs":
              return (
                <Trans id="map.details-sidebar-panel.next-button.energy-tariffs">
                  Energy Tariffs in detail
                </Trans>
              );
            case "netTariffs":
              return (
                <Trans id="map.details-sidebar-panel.next-button.net-tariffs">
                  Net Tariffs in detail
                </Trans>
              );
            case "saidi":
              return (
                <Trans id="map.details-sidebar-panel.next-button.saidi">
                  SAIDI in detail
                </Trans>
              );
            case "saifi":
              return (
                <Trans id="map.details-sidebar-panel.next-button.saifi">
                  SAIFI in detail
                </Trans>
              );
            case "outageInfo":
              return (
                <Trans id="map.details-sidebar-panel.next-button.service-quality">
                  Service Quality in detail
                </Trans>
              );
            case "daysInAdvanceOutageNotification":
              return (
                <Trans id="map.details-sidebar-panel.next-button.service-quality">
                  Service Quality in detail
                </Trans>
              );
            case "compliance":
              return (
                <Trans id="map.details-sidebar-panel.next-button.compliance">
                  Compliance in detail
                </Trans>
              );
            default: {
              // This ensures exhaustive checking
              const _exhaustiveCheck: never = indicator;
              return _exhaustiveCheck;
            }
          }
        })()}
      </Button>
      {/* Show all Sunshine indicators by going to sunshine detials "overview" */}
      {tab === "sunshine" && (
        <Button
          variant="outlined"
          size="sm"
          sx={{
            justifyContent: "space-between",
          }}
          endIcon={<Icon name="arrowright" />}
          color="primary"
          href={`/sunshine/operator/${selectedItem.id}/overview`}
        >
          <Trans id="map.details-sidebar-panel.next-button.sunshine-overview">
            Show all Sunshine Indicators
          </Trans>
        </Button>
      )}
    </MapDetailsContentWrapper>
  );
};
