import { t, Trans } from "@lingui/macro";
import { ScaleThreshold } from "d3";
import { ascending, descending, mean, rollup } from "d3-array";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "theme-ui";
import { Entity } from "../domain/data";
import { useFormatCurrency } from "../domain/helpers";
import {
  CantonMedianObservationFieldsFragment,
  OperatorObservationFieldsFragment,
} from "../graphql/queries";
import { Icon } from "../icons";
import { MiniSelect, SearchField } from "./form";
import { InfoDialogButton } from "./info-dialog";
import { HighlightContext } from "./map";
import { RadioTabs } from "./radio-tabs";
import Stack from "./stack";

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
    <NextLink
      href={{
        pathname: `/${entity}/[id]`,
        query: { ...query, id },
      }}
      passHref
    >
      <Flex
        onMouseOver={() => setHighlightContext({ entity, id })}
        onMouseOut={() => setHighlightContext(undefined)}
        as="a"
        sx={{
          pl: [2, 4, 4],
          py: 1,
          mx: 0,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome300",
          alignItems: "center",
          height: "3.5rem",
          lineHeight: 1,
          color: "text",
          textDecoration: "none",
          "&:hover": {
            bg: "mutedDarker",
          },
          "&:active": {
            bg: "primaryLight",
          },
          "&:focus": {
            outline: 0,
            bg: "primaryLight",
          },
        }}
      >
        <Text variant="paragraph2" sx={{ flexGrow: 1, mr: 1 }}>
          {label}
        </Text>
        <Box
          sx={{
            borderRadius: "circle",
            px: 2,
            flexShrink: 0,
          }}
          style={{ background: colorScale(value) }}
        >
          <Text variant="paragraph2">{formatNumber(value)}</Text>
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
            variant="inline"
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

const PlaceholderListItem = ({}: {}) => {
  const { query } = useRouter();
  return (
    <Flex
      sx={{
        pl: 2,
        py: 1,
        mx: [2, 4, 4],
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome300",
        alignItems: "center",
        height: "3.5rem",
        lineHeight: 1,
        color: "text",
      }}
    >
      <Text
        variant="paragraph2"
        sx={{ flexGrow: 1, bg: "monochrome200", mr: 5 }}
      >
        &nbsp;
      </Text>
      <Box
        sx={{
          borderRadius: "circle",
          px: 2,
          flexShrink: 0,
          bg: "monochrome200",
          width: "5ch",
        }}
      >
        <Text variant="paragraph2">&nbsp;</Text>
      </Box>
      <Box sx={{ width: "24px", flexShrink: 0, color: "monochrome200" }}>
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
      >
        <Box variant="buttons.inline">&nbsp;</Box>
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
}: Props) => {
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
  }, [observations, listState]);

  const filtered = useMemo(() => {
    if (searchQuery === "") {
      return grouped;
    }
    const filterRe = new RegExp(`${searchQuery}`, "i");
    return grouped.filter(([k, d]) => d.label?.match(filterRe));
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

      <Box
        sx={{
          mx: 0,
          px: [2, 4, 4],
          py: [2, 4, 4],
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome300",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
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
            iconOnly
            slug="help-search-list"
            label={searchLabel}
            smaller
          />
        </Stack>

        <Flex sx={{ justifyContent: "space-between", mt: 2 }}>
          <label htmlFor="listSort">
            <Text
              color="secondary"
              sx={{
                fontFamily: "body",
                fontSize: [1, 2, 2],
                lineHeight: "24px",
              }}
            >
              <Trans id="dataset.sortby">Sortieren</Trans>
            </Text>
          </label>

          <MiniSelect
            id="listSort"
            value={sortState}
            options={sortOptions}
            onChange={(e) => {
              setSortState(e.currentTarget.value as SortState);
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
