import { t, Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { ScaleThreshold } from "d3";
import { ascending, descending, mean, rollup } from "d3-array";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";

import Flex from "src/components/flex";
import {
  CantonMedianObservationFieldsFragment,
  OperatorObservationFieldsFragment,
} from "src/graphql/queries";
import { makeStyles } from "src/themes/makeStyles";

import { Entity } from "../domain/data";
import { useFormatCurrency } from "../domain/helpers";
import { Icon } from "../icons";

import { MiniSelect, SearchField } from "./form";
import { HighlightContext } from "./highlight-context";
import { InfoDialogButton } from "./info-dialog";
import { RadioTabs } from "./radio-tabs";
import Stack from "./stack";

const useStyles = makeStyles()(
  ({ palette: { grey, primary, muted, text }, spacing: s }) => ({
    listItem: {
      paddingLeft: [s(2), s(4)],
      paddingTop: s(1),
      paddingBottom: s(2),
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: grey[300],
      alignItems: "center",
      height: "3.5rem",
      lineHeight: "1rem",
      color: text.primary,
      textDecoration: "none",
      "&:hover": {
        backgroundColor: muted.dark,
      },
      "&:active": {
        backgroundColor: primary.light,
      },
      "&:focus": {
        outline: 0,
        backgroundColor: primary.light,
      },
    },

    placeholderListItem: {
      paddingLeft: s(2),
      paddingTop: s(1),
      paddingBottom: s(1),
      margin: [s(0, 2), s(0, 4)],
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: grey[300],
      alignItems: "center",
      height: "3.5rem",
      lineHeight: "1rem",
      color: "text",
    },

    placeholderListItemText: {
      borderRadius: 99999,
      padding: s(0, 2),
      flexShrink: 0,
      bgcolor: grey[200],
      width: "5ch",
    },

    listContent: {
      padding: [s(2), s(4), s(4)],
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: grey[300],
    },
  })
);

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
  const { classes } = useStyles();
  const { query } = useRouter();
  const { setValue: setHighlightContext } = useContext(HighlightContext);
  const entity =
    listState === "MUNICIPALITIES"
      ? "municipality"
      : listState === "PROVIDERS"
      ? "operator"
      : ("canton" as Entity);
  return (
    <NextLink
      href={{
        pathname: `/${entity}/[id]`,
        query: { ...query, id },
      }}
      passHref
    >
      <Flex
        onMouseOver={() => setHighlightContext({ entity, id, label, value })}
        onMouseOut={() => setHighlightContext(undefined)}
        component="a"
        className={classes.listItem}
      >
        <Typography variant="body2" sx={{ flexGrow: 1, mr: 1 }}>
          {label}
        </Typography>
        <Box
          sx={{
            borderRadius: "1rem",
            px: 2,
            flexShrink: 0,
          }}
          style={{ background: colorScale(value) }}
        >
          <Typography variant="body2">{formatNumber(value)}</Typography>
        </Box>
        <Box sx={{ width: "24px", flexShrink: 0 }}>
          <Icon name="chevronright"></Icon>
        </Box>
      </Flex>
    </NextLink>
  );
};

interface Props {
  observations: OperatorObservationFieldsFragment[];
  cantonObservations: CantonMedianObservationFieldsFragment[];
  colorScale: ScaleThreshold<number, string>;
  observationsQueryFetching: boolean;
}

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
  const { classes } = useStyles();
  return (
    <Flex className={classes.placeholderListItem}>
      <Typography
        variant="body2"
        sx={{ flexGrow: 1, bgcolor: "grey.200", mr: 5 }}
      >
        &nbsp;
      </Typography>
      <Box className={classes.placeholderListItemText}>
        <Typography variant="body2">&nbsp;</Typography>
      </Box>
      <Box sx={{ width: "24px", flexShrink: 0, color: "grey.200" }}>
        <Icon name="chevronright"></Icon>
      </Box>
    </Flex>
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
      />
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
}: Props) => {
  const { classes } = useStyles();
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
    <>
      <RadioTabs<ListState>
        name="list-state-tabs"
        variant="borderlessTabs"
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
        setValue={setListState}
      />

      <Box className={classes.listContent}>
        <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
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
          <InfoDialogButton
            slug="help-search-list"
            label={searchLabel}
            smaller
          />
        </Stack>

        <Flex
          sx={{ alignItems: "center", justifyContent: "space-between", mt: 2 }}
        >
          <label htmlFor="listSort">
            <Typography
              color="secondary"
              sx={{
                fontFamily: "body",
                fontSize: ["0.625rem", "0.75rem", "0.75rem"],
                lineHeight: "24px",
              }}
            >
              <Trans id="dataset.sortby">Sortieren</Trans>
            </Typography>
          </label>

          <MiniSelect
            id="listSort"
            value={sortState}
            options={sortOptions}
            onChange={(e) => {
              setSortState(e.target.value as SortState);
            }}
          ></MiniSelect>
        </Flex>
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
    </>
  );
};
