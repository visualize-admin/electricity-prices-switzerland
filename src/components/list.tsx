import { t, Trans } from "@lingui/macro";
import { Box, Button, Divider, Typography } from "@mui/material";
import { ascending, descending, mean, rollup, ScaleThreshold } from "d3";
import { useRouter } from "next/router";
import {
  MouseEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ButtonGroup } from "src/components/button-group";
import { MiniSelect, SearchField } from "src/components/form";
import { HighlightContext } from "src/components/highlight-context";
import { Stack } from "src/components/stack";
import { Entity } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import {
  CantonMedianObservationFieldsFragment,
  OperatorObservationFieldsFragment,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import useEvent from "src/lib/use-event";
import { useFlag } from "src/utils/flags";

import { AnchorNav } from "./anchor-nav";
import { PriceEvolution } from "./detail-page/price-evolution-line-chart";
import { InlineDrawer } from "./drawer";
import { ListState, useMap } from "./map-context";
import {
  MapDetailsContentWrapper,
  MapDetailsEntityHeader,
  MapDetailsEntityTable,
} from "./map-details-content";

type ListItemProps = {
  id: string;
  label: string;
  value: number;
  colorScale: (d: number) => string;
  formatNumber: (d: number) => string;
  listState: ListState;
  handleClick?: MouseEventHandler<HTMLAnchorElement>;
};

const ListItem = ({
  id,
  label,
  value,
  colorScale,
  formatNumber,
  listState,
  handleClick,
}: ListItemProps) => {
  const { setValue: setHighlightContext } = useContext(HighlightContext);
  const entity =
    listState === "MUNICIPALITIES"
      ? "municipality"
      : listState === "OPERATORS"
      ? "operator"
      : ("canton" as Entity);

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
  listState,
}: {
  items: [string, ListItemType][];
  colorScale: ScaleThreshold<number, string>;
  listState: ListState;
}) => {
  const [truncated, setTruncated] = useState<number>(TRUNCATION_INCREMENT);
  const formatNumber = useFormatCurrency();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ListItemType | null>(null);
  const { activeId, setActiveId } = useMap();
  const isSunshine = useFlag("sunshine");
  const router = useRouter();

  const handleListItemSelect = useEvent(
    (_: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>, id: string) => {
      if (isSunshine) {
        setActiveId(id);
      } else {
        router.push(`/${getEntity()}/${id}`);
      }
    }
  );
  useEffect(() => {
    if (activeId) {
      const selected = items.find(([itemId]) => itemId === activeId);
      setSelectedItem(selected?.[1] ?? null);
      setOpen(true);
    }
  }, [activeId, items, listState]);

  const listItems =
    items.length > truncated ? items.slice(0, truncated) : items;

  const getEntity = (): Entity => {
    switch (listState) {
      case "MUNICIPALITIES":
        return "municipality";
      case "OPERATORS":
        return "operator";
      case "CANTONS":
        return "canton";
    }
  };

  return (
    <Box>
      {selectedItem && (
        <InlineDrawer open={open} onClose={() => setOpen(false)}>
          <MapDetailsContentWrapper
            onBack={() => {
              setOpen(false);
              setActiveId(null);
            }}
          >
            <MapDetailsEntityHeader entity={listState} {...selectedItem} />
            <MapDetailsEntityTable
              colorScale={colorScale}
              entity={listState}
              {...selectedItem}
            />
            <Divider />
            <PriceEvolution
              priceComponents={["total"]}
              id={selectedItem.id}
              entity={getEntity()}
            />
            <Button
              variant="contained"
              color="secondary"
              size="sm"
              sx={{
                justifyContent: "space-between",
              }}
              href={`/${getEntity()}/${selectedItem.id}`}
            >
              <Trans id="map.details-sidebar-panel.next-button">
                Energie Preise Detail anzeigen
              </Trans>
              <Icon name="arrowright" />
            </Button>
          </MapDetailsContentWrapper>
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
            formatNumber={formatNumber}
            listState={listState}
            handleClick={(e) => handleListItemSelect(e, d.id)}
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
            <Trans id="list.showmore">Mehr anzeigen …</Trans>
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

export const List = ({
  observations,
  cantonObservations,
  colorScale,
  observationsQueryFetching,
}: {
  observations: OperatorObservationFieldsFragment[];
  cantonObservations: CantonMedianObservationFieldsFragment[];
  colorScale: ScaleThreshold<number, string>;
  observationsQueryFetching: boolean;
}) => {
  const [sortState, setSortState] = useState<SortState>("ASC");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { listState, setListState } = useMap();

  const sortOptions = [
    {
      value: "ASC" as SortState,
      label: t({ id: "list.order.asc", message: "Cheapest first" }),
    },
    {
      value: "DESC" as SortState,
      label: t({ id: "list.order.desc", message: "Most expensive first" }),
    },
  ];
  const searchLabel = t({ id: "list.search.label", message: "Filter list" });

  const grouped = useMemo(() => {
    return listState === "CANTONS"
      ? Array.from(
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
        )
      : Array.from(
          rollup(
            observations,
            (values) => {
              const first = values[0];
              const operatorIds = new Set(values.map((v) => v.operator));
              return {
                id:
                  listState === "OPERATORS"
                    ? first.operator
                    : first.municipality,
                label:
                  listState === "OPERATORS"
                    ? first.operatorLabel
                    : first.municipalityLabel,
                value: mean(values, (d) => d.value) ?? first.value,
                canton: first.canton,
                cantonLabel: first.cantonLabel,
                operators:
                  listState === "MUNICIPALITIES"
                    ? observations
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
                        ).result
                    : [
                        {
                          id: first.operator,
                          label: first.operatorLabel,
                          value: first.value,
                        },
                      ],
              };
            },
            (d) => (listState === "OPERATORS" ? d.operator : d.municipality)
          )
        );
  }, [listState, cantonObservations, observations]);

  const filtered = useMemo(() => {
    if (searchQuery === "") {
      return grouped;
    }
    const filterRe = new RegExp(`${searchQuery}`, "i");
    return grouped.filter(([, d]) => d.label?.match(filterRe));
  }, [grouped, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort(([, a], [, b]) => {
      return sortState === "ASC"
        ? ascending(a.value, b.value)
        : descending(a.value, b.value);
    });
  }, [filtered, sortState]);

  const listItems = sorted;

  return (
    <Box
      sx={{
        px: 6,
        flexDirection: "column",
        gap: 4,
      }}
      display="flex"
    >
      <ButtonGroup<ListState>
        id="list-state-tabs"
        options={[
          {
            value: "MUNICIPALITIES",
            label: t({ id: "list.municipalities", message: "Municipalities" }),
          },
          {
            value: "CANTONS",
            label: t({ id: "list.cantons", message: "Cantons" }),
          },
          {
            value: "OPERATORS",
            label: t({ id: "list.operators", message: "Network operator" }),
          },
        ]}
        value={listState}
        label={t({ id: "list.viewby.label", message: "View according to" })}
        setValue={setListState}
      />
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
      {observationsQueryFetching ? (
        <PlaceholderListItems />
      ) : (
        <ListItems
          items={listItems}
          colorScale={colorScale}
          listState={listState}
        />
      )}
    </Box>
  );
};
