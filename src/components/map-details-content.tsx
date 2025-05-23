import { Trans } from "@lingui/macro";
import { Divider, Link, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ScaleThreshold } from "d3";
import NextLink from "next/link";
import { ReactElement, ReactNode } from "react";

import { useFormatCurrency } from "src/domain/helpers";
import { getLocalizedLabel } from "src/domain/translation";
import { Icon } from "src/icons";
import { QueryStateSingle, useQueryStateSingle } from "src/lib/use-query-state";

import { ListItemType, ListState } from "./list";

type MapDetailsContentProps = {
  onBack: () => void;
  children: ReactNode;
};

export const MapDetailsContentWrapper = (props: MapDetailsContentProps) => {
  const { onBack, children } = props;
  return (
    <Stack direction={"column"} spacing={4} padding={6}>
      <Link
        component={"button"}
        sx={{ alignItems: "center", display: "flex", gap: 1 }}
        color="tertiary"
        size={"md"}
        onClick={onBack}
      >
        <Icon name="arrowleft" />
        <Trans id="map.details-sidebar-panel.back-button">
          Zurück zu den Filtern
        </Trans>
      </Link>
      <Divider
        sx={{
          bgcolor: "secondary.50",
        }}
      />
      {children}
    </Stack>
  );
};

type MapDetailProps = ListItemType & { entity: ListState };

export const MapDetailsEntityHeader = (props: MapDetailProps) => {
  const { entity, label, canton, cantonLabel, operators } = props;
  const entityValue = getLocalizedLabel({ id: entity.toLowerCase() });
  console.log(operators);
  return (
    <Stack direction={"column"} spacing={2}>
      <Stack direction={"column"}>
        <Typography
          lineHeight={"140%"}
          variant="body3"
          sx={{
            fontFeatureSettings: "'liga' off, 'clig' off",
          }}
        >
          {entityValue}
        </Typography>
        <Typography
          fontWeight={700}
          lineHeight={"160%"}
          variant="h3"
          sx={{
            fontFeatureSettings: "'liga' off, 'clig' off",
          }}
        >
          {label}
        </Typography>
      </Stack>
      {entity !== "CANTONS" && canton && cantonLabel && (
        <Typography variant="body3" color={"text.500"}>
          <Trans id="search.result.canton">Canton</Trans>:{" "}
          {/* FIXME: Currently the functionality here is not clear yet  */}
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

const entityTableRows: Record<ListState, (keyof QueryStateSingle)[]> = {
  OPERATORS: ["period", "priceComponent", "category", "product"],
  MUNICIPALITIES: [
    "period",
    "priceComponent",
    "category",
    "product",
    "operator",
  ],
  CANTONS: ["period", "priceComponent", "category", "product"],
};

export const MapDetailsEntityTable = (
  props: MapDetailProps & { colorScale: ScaleThreshold<number, string> }
) => {
  const { entity, operators, colorScale } = props;
  const [queryState] = useQueryStateSingle();
  const tableRows = entityTableRows[entity];
  const formatNumber = useFormatCurrency();

  return (
    <Stack direction={"column"} spacing={2}>
      {tableRows.map((row, i) => {
        return (
          <KeyValueTableRow<QueryStateSingle>
            key={`${row}-${i}`}
            dataKey={row}
            state={{ ...queryState, operator: operators?.length.toString() }}
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
              <Box
                sx={{
                  borderRadius: 9999,
                  px: 2,
                  flexShrink: 0,
                }}
                style={{ background: colorScale(operator.value) }}
              >
                <Typography variant="body3" lineHeight={1.4} color="black">
                  {formatNumber(operator.value)}
                </Typography>
              </Box>
            }
          />
        );
      })}
    </Stack>
  );
};

const KeyValueTableRow = <T extends Record<string, string>>(props: {
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
          fontFeatureSettings: "'liga' off, 'clig' off",
          textDecoration: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        variant="body3"
      >
        {state
          ? getLocalizedLabel({ id: dataKey.toString() })
          : dataKey.toString()}
      </Typography>
      {tag ? (
        tag
      ) : (
        <Typography
          sx={{
            fontFeatureSettings: "'liga' off, 'clig' off",
            textTransform: "capitalize",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          variant="body3"
          fontWeight={700}
        >
          {state?.[dataKey]}
        </Typography>
      )}
    </Stack>
  );
};
