import { t, Trans } from "@lingui/macro";
import { Box, Button, Link, Typography } from "@mui/material";
import { ascending, descending, mean, rollup, ScaleThreshold } from "d3";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";

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

const ListItem = ({
  id,
  label,
  value,
  colorScale,
  formatNumber,
  listState,
}: {
  id: string;
  label: string;
  value: number;
  colorScale: (d: number) => string;
  formatNumber: (d: number) => string;
  listState: ListState;
}) => {
  const { query } = useRouter();
  const { setValue: setHighlightContext } = useContext(HighlightContext);
  const entity =
    listState === "MUNICIPALITIES"
      ? "municipality"
      : listState === "PROVIDERS"
      ? "operator"
      : ("canton" as Entity);

  return (
    <Link
      underline="none"
      color="inherit"
      component={NextLink}
      href={{
        pathname: `/${entity}/[id]`,
        query: { ...query, id },
      }}
      onMouseOver={() => setHighlightContext({ entity, id, label, value })}
      onMouseOut={() => setHighlightContext(undefined)}
      sx={{
        pl: 3,
        py: 4,
        mx: 0,
        gap: 1,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome.200",
        alignItems: "center",
        minHeight: "3.5rem",
        lineHeight: "1rem",
        color: "text",
        textDecoration: "none",
        "&:hover": {
          bgcolor: "monochrome.50",
        },
        "&:active": {
          bgcolor: "monochrome.100",
        },
        "&:focus": {
          outline: 0,
          bgcolor: "monochrome.100",
        },
      }}
      display="flex"
    >
      <Typography variant="body2" sx={{ flexGrow: 1, mr: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          borderRadius: 9999,
          px: 2,
          flexShrink: 0,
        }}
        style={{ background: colorScale(value) }}
      >
        <Typography variant="body2" color="black">
          {formatNumber(value)}
        </Typography>
      </Box>
      <Box sx={{ width: "24px", flexShrink: 0 }}>
        <Icon name="arrowright"></Icon>
      </Box>
    </Link>
  );
};

const TRUNCATION_INCREMENT = 20;

const ListItems = ({
  items,
  colorScale,
  listState,
}: {
  items: [string, { id: string; label?: string | null; value: number }][];
  colorScale: ScaleThreshold<number, string>;
  listState: ListState;
}) => {
  const [truncated, setTruncated] = useState<number>(TRUNCATION_INCREMENT);
  const formatNumber = useFormatCurrency();

  const listItems =
    items.length > truncated ? items.slice(0, truncated) : items;

  return (
    <Box>
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
        <Icon name="chevronright"></Icon>
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

type ListState = "MUNICIPALITIES" | "PROVIDERS" | "CANTONS";
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
  const [listState, setListState] = useState<ListState>("MUNICIPALITIES");
  const [sortState, setSortState] = useState<SortState>("ASC");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sortOptions = [
    {
      value: "ASC" as SortState,
      label: t({ id: "list.order.asc", message: `Günstigste zuerst` }),
    },
    {
      value: "DESC" as SortState,
      label: t({ id: "list.order.desc", message: `Teuerste zuerst` }),
    },
  ];
  const searchLabel = t({ id: "list.search.label", message: `Liste filtern` });

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
              return {
                id:
                  listState === "PROVIDERS"
                    ? first.operator
                    : first.municipality,
                label:
                  listState === "PROVIDERS"
                    ? first.operatorLabel
                    : first.municipalityLabel,
                value: mean(values, (d) => d.value) ?? first.value,
              };
            },
            (d) => (listState === "PROVIDERS" ? d.operator : d.municipality)
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
            label: t({ id: "list.municipalities" }),
          },
          {
            value: "CANTONS",
            label: t({ id: "list.cantons" }),
          },
          {
            value: "PROVIDERS",
            label: t({ id: "list.operators" }),
          },
        ]}
        value={listState}
        label={t({ id: "list.viewby.label", message: `Ansicht nach` })}
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
