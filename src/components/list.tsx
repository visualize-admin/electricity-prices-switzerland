import { t, Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { ascending, descending, mean, rollup, ScaleThreshold } from "d3";
import { MouseEventHandler, useContext, useMemo, useState } from "react";

import { MiniSelect, SearchField } from "src/components/form";
import { HighlightContext } from "src/components/highlight-context";
import { Stack } from "src/components/stack";
import { Entity, ValueFormatter } from "src/domain/data";
import { QueryStateSunshineIndicator } from "src/domain/query-states";
import {
  CantonMedianObservationFieldsFragment,
  OperatorObservationFieldsFragment,
  SunshineDataRow,
} from "src/graphql/queries";
import { Icon } from "src/icons";

import { AnchorNav } from "./anchor-nav";
import { InlineDrawer } from "./drawer";
import { useMap } from "./map-context";
import { MapDetailsContent } from "./map-details-content";

type ListItemProps = {
  id: string;
  label: string;
  value: number;
  colorScale: (d: number) => string;
  valueFormatter: (d: number) => string;
  entity: Entity;
  handleClick?: MouseEventHandler<HTMLAnchorElement>;
};

const ListItem = ({
  id,
  label,
  value,
  colorScale,
  valueFormatter: formatNumber,
  entity,
  handleClick,
}: ListItemProps) => {
  const { setValue: setHighlightContext } = useContext(HighlightContext);

  return (
    <AnchorNav
      icon={<Icon name="arrowright" />}
      tag={
        <Box
          sx={{
            borderRadius: 9999,
            px: 2,
            flexShrink: 0,
          }}
          style={{ background: colorScale(value) }}
        >
          <Typography variant="body3" lineHeight={1.4} color="black">
            {formatNumber(value)}
          </Typography>
        </Box>
      }
      size="sm"
      label={label}
      underline="none"
      color="inherit"
      component={"a"}
      onClick={(event) => handleClick?.(event)}
      onMouseOver={() => setHighlightContext({ entity, id, label, value })}
      onMouseOut={() => setHighlightContext(undefined)}
    />
  );
};

const TRUNCATION_INCREMENT = 20;

export type ListItemType = {
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
};

const ListItems = ({
  items,
  colorScale,
  entity,
  valueFormatter,
}: {
  items: [string, ListItemType][];
  colorScale: ScaleThreshold<number, string>;
  entity: Entity;
  valueFormatter: ValueFormatter;
}) => {
  const [truncated, setTruncated] = useState<number>(TRUNCATION_INCREMENT);
  const { activeId, setActiveId, onEntitySelect } = useMap();

  const selectedItem = useMemo(() => {
    if (activeId) {
      const selected = items.find(([itemId]) => itemId === activeId);
      return selected?.[1] ?? null;
    }
  }, [activeId, items]);

  const listItems =
    items.length > truncated ? items.slice(0, truncated) : items;

  return (
    <Box>
      {selectedItem && (
        <InlineDrawer open={!!selectedItem} onClose={() => setActiveId(null)}>
          <MapDetailsContent
            colorScale={colorScale}
            entity={entity}
            selectedItem={selectedItem}
            onBack={() => setActiveId(null)}
          />
        </InlineDrawer>
      )}
      {listItems.map(([id, d]) => {
        return (
          <ListItem
            key={id}
            id={id}
            value={d.value}
            label={d.label || d.id}
            colorScale={colorScale}
            valueFormatter={valueFormatter}
            entity={entity}
            handleClick={(e) => onEntitySelect(e, entity, d.id)}
          />
        );
      })}

      {items.length > truncated && (
        <Box
          sx={{
            textAlign: "center",
            p: 3,
          }}
        >
          <Button
            variant="text"
            onClick={() => setTruncated((n) => n + TRUNCATION_INCREMENT)}
          >
            <Trans id="list.showmore">Show more …</Trans>
          </Button>
        </Box>
      )}
    </Box>
  );
};

const placeholderListItems = Array.from(
  { length: TRUNCATION_INCREMENT },
  (_, id) => id
);

const PlaceholderListItem = () => {
  return (
    <Box
      sx={{
        pl: 2,
        py: 1,
        mx: [2, 4, 4],
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "secondary.300",
        alignItems: "center",
        height: "3.5rem",
        lineHeight: "1rem",
        color: "text",
      }}
      display="flex"
    >
      <Typography
        variant="body2"
        sx={{ flexGrow: 1, bgcolor: "secondary.200", mr: 5 }}
      ></Typography>
      <Box
        sx={{
          borderRadius: 9999,
          px: 2,
          flexShrink: 0,
          bgcolor: "secondary.200",
          width: "5ch",
        }}
      >
        <Typography variant="body2">&nbsp;</Typography>
      </Box>
      <Box sx={{ width: "24px", flexShrink: 0, color: "secondary.200" }}>
        <Icon name="chevronright" />
      </Box>
    </Box>
  );
};

const PlaceholderListItems = () => {
  return (
    <Box>
      {placeholderListItems.map((id) => {
        return <PlaceholderListItem key={id} />;
      })}

      <Box
        sx={{
          textAlign: "center",
          p: 3,
        }}
      >
        &nbsp;
      </Box>
    </Box>
  );
};

type SortState = "ASC" | "DESC";

type LabelType = "prices" | "quality" | "timely";
const indicatorLabelTypes: Record<
  "prices" | QueryStateSunshineIndicator,
  LabelType
> = {
  prices: "prices",
  // "networkCosts" | "netTariffs" | "energyTariffs" | "saidi" | "saifi" | "serviceQuality" | "compliance"
  networkCosts: "prices",
  netTariffs: "prices",
  energyTariffs: "prices",
  saidi: "quality",
  saifi: "quality",
  serviceQuality: "timely",
  compliance: "timely",
} as const;

const labels: Record<
  LabelType,
  {
    ASC: string;
    DESC: string;
  }
> = {
  prices: {
    ASC: t({ id: "list.order.prices.asc", message: "Cheapest first" }),
    DESC: t({ id: "list.order.prices.desc", message: "Most expensive first" }),
  },
  quality: {
    ASC: t({ id: "list.order.quality.asc", message: "Best quality first" }),
    DESC: t({ id: "list.order.quality.desc", message: "Worst quality first" }),
  },
  timely: {
    ASC: t({ id: "list.order.timely.asc", message: "Most timely first" }),
    DESC: t({ id: "list.order.timely.desc", message: "Least timely first" }),
  },
};

export const List = ({
  grouped,
  colorScale,
  fetching,
  entity,
  valueFormatter,
  indicator,
}: {
  grouped: Groups;
  colorScale: ScaleThreshold<number, string>;
  fetching: boolean;
  entity: Entity;
  valueFormatter: ValueFormatter;
  indicator: QueryStateSunshineIndicator | "prices";
}) => {
  const [sortState, setSortState] = useState<SortState>("ASC");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sortOptions = [
    {
      value: "ASC" as SortState,
      label: labels[indicatorLabelTypes[indicator]].ASC,
    },
    {
      value: "DESC" as SortState,
      label: labels[indicatorLabelTypes[indicator]].DESC,
    },
  ];
  const searchLabel = t({ id: "list.search.label", message: "Filter list" });

  const filtered = useMemo(() => {
    if (searchQuery === "") {
      return grouped;
    }
    const filterRe = new RegExp(`${searchQuery}`, "i");
    return grouped.filter(([, d]) => d.label?.match(filterRe));
  }, [grouped, searchQuery]);

  const listItems = useMemo(() => {
    return [...filtered].sort(([, a], [, b]) => {
      return sortState === "ASC"
        ? ascending(a.value, b.value)
        : descending(a.value, b.value);
    });
  }, [filtered, sortState]);

  return (
    <Box flexDirection="column" gap={4} display="flex">
      <Stack
        direction="row"
        spacing={0}
        sx={{ width: "100%", alignItems: "center" }}
      >
        <SearchField
          id="listSearch"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.currentTarget.value);
          }}
          onReset={() => {
            setSearchQuery("");
          }}
          label={searchLabel}
          placeholder={searchLabel}
          sx={{ flexGrow: 1 }}
        />
      </Stack>
      <Box
        sx={{ justifyContent: "space-between", mb: 2, alignItems: "center" }}
        display="flex"
      >
        <Typography
          display="span"
          component="label"
          htmlFor="listSort"
          color="secondary"
          sx={{
            fontSize: ["0.625rem", "0.75rem", "0.75rem"],
            lineHeight: "24px",
          }}
        >
          {<Trans id="dataset.results">{listItems.length} Resultate</Trans>}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography
            display="span"
            component="label"
            htmlFor="listSort"
            color="text.primary"
            sx={{
              fontSize: ["0.625rem", "0.75rem", "0.75rem"],
              lineHeight: "24px",
              fontWeight: 700,
            }}
          >
            <Trans id="dataset.sortby">Sortieren</Trans>
          </Typography>
          <MiniSelect
            id="listSort"
            value={sortState}
            options={sortOptions}
            onChange={(e) => {
              setSortState(e.currentTarget?.value as SortState);
            }}
          />
        </Box>
      </Box>
      {fetching ? (
        <PlaceholderListItems />
      ) : (
        <ListItems
          items={listItems}
          colorScale={colorScale}
          valueFormatter={valueFormatter}
          entity={entity}
        />
      )}
    </Box>
  );
};

type Groups = [
  string,
  {
    id: string;
    label: string | null | undefined;
    value: number;
    canton: string;
    cantonLabel: string | null | undefined;
  }
][];

export function groupsFromElectricityMunicipalities(
  observations: OperatorObservationFieldsFragment[]
): Groups {
  return Array.from(
    rollup(
      observations,
      (values) => {
        const first = values[0];
        const operatorIds = new Set(values.map((v) => v.operator));
        return {
          id: first.municipality,
          label: first.municipalityLabel,
          value: mean(values, (d) => d.value) ?? first.value,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
          operators: observations
            .filter((o) => operatorIds.has(o.operator))
            .reduce(
              (acc, o) => {
                if (acc.seen.has(o.operator)) return acc;
                acc.seen.add(o.operator);
                acc.result?.push({
                  id: o.operator,
                  label: o.operatorLabel,
                  value: o.value,
                });
                return acc;
              },
              {
                seen: new Set<string>(),
                result: [] as ListItemType["operators"],
              }
            ).result,
        };
      },
      (d) => d.municipality
    )
  );
}

const isValueAttributeDefined = <T extends { value: number | undefined }>(
  d: T
): d is T & { value: number } => {
  return d.value !== undefined && d.value !== null;
};
export const groupsFromSunshineObservations = (
  observations: SunshineDataRow[],
  sunshineAccessor: (d: SunshineDataRow) => number | undefined
): Groups => {
  const withValues = observations
    .map((d) => ({
      ...d,
      value: sunshineAccessor(d),
    }))
    .filter(isValueAttributeDefined);

  return Array.from(
    rollup(
      withValues,
      (values) => {
        const first = values[0];
        return {
          id: `${first.operatorId}`,
          label: first.name,
          value: mean(values, (d) => d.value) ?? first.value,
          canton: "",
          cantonLabel: "",
          operators: values.map((v) => ({
            id: v.operatorId,
            label: v.name,
            value: v.value,
          })),
        };
      },
      (d) => `${d.operatorId}`
    )
  );
};

export function groupsFromElectricityOperators(
  observations: OperatorObservationFieldsFragment[]
): Groups {
  return Array.from(
    rollup(
      observations,
      (values) => {
        const first = values[0];
        return {
          id: first.operator,
          label: first.operatorLabel,
          value: mean(values, (d) => d.value) ?? first.value,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
          operators: [
            {
              id: first.operator,
              label: first.operatorLabel,
              value: first.value,
            },
          ],
        };
      },
      (d) => d.operator
    )
  );
}

export function groupsFromCantonElectricityObservations(
  cantonObservations: CantonMedianObservationFieldsFragment[]
): [
  string,
  {
    id: string;
    label: string | null | undefined;
    value: number;
    canton: string;
    cantonLabel: string | null | undefined;
  }
][] {
  return Array.from(
    rollup(
      cantonObservations,
      (values) => {
        const first = values[0];
        return {
          id: first.canton,
          label: first.cantonLabel,
          value: mean(values, (d) => d.value) ?? first.value,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
        };
      },
      (d) => d.canton
    )
  );
}
