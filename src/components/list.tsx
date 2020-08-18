import { t, Trans } from "@lingui/macro";
import { ScaleThreshold } from "d3";
import { ascending, descending, rollup } from "d3-array";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "theme-ui";
import { useFormatCurrency } from "../domain/helpers";
import {
  Observation,
  ObservationsQuery,
  MedianObservationFieldsFragment,
  ProviderObservationFieldsFragment,
} from "../graphql/queries";
import { Icon } from "../icons";
import { MiniSelect, SearchField } from "./form";
import { useI18n } from "./i18n-context";
import { LocalizedLink } from "./links";
import { RadioTabs } from "./radio-tabs";

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
  return (
    <LocalizedLink
      pathname={`/[locale]/${
        listState === "MUNICIPALITIES"
          ? "municipality"
          : listState === "PROVIDERS"
          ? "provider"
          : "canton"
      }/[id]`}
      query={{
        ...query,
        id,
      }}
      passHref
    >
      <Flex
        as="a"
        sx={{
          py: 1,
          px: 2,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome300",
          alignItems: "center",
          height: "3.5rem",
          lineHeight: 1,
          color: "text",
          textDecoration: "none",
          ":focus": {
            outline: 0,
            bg: "primaryLight",
          },
        }}
      >
        <Text variant="meta" sx={{ flexGrow: 1 }}>
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
          <Text variant="meta">{formatNumber(value)}</Text>
        </Box>
        <Box sx={{ width: "24px", flexShrink: 0 }}>
          <Icon name="chevronright"></Icon>
        </Box>
      </Flex>
    </LocalizedLink>
  );
};

interface Props {
  observations: ObservationsQuery["observations"];
  colorScale: ScaleThreshold<number, string>;
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
    <Box sx={{}}>
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
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "monochrome300",
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

type ListState = "MUNICIPALITIES" | "PROVIDERS" | "CANTONS";
type SortState = "ASC" | "DESC";

export const List = ({ observations, colorScale }: Props) => {
  const [listState, setListState] = useState<ListState>("MUNICIPALITIES");
  const [sortState, setSortState] = useState<SortState>("ASC");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const i18n = useI18n();

  const sortOptions = [
    {
      value: "ASC" as SortState,
      label: i18n._(t("list.order.asc")`Günstigste zuerst`),
    },
    {
      value: "DESC" as SortState,
      label: i18n._(t("list.order.desc")`Teuerste zuerst`),
    },
  ];
  const searchLabel = i18n._(t("list.search.label")`Liste filtern`);

  const grouped = useMemo(() => {
    return listState === "CANTONS"
      ? Array.from(
          rollup(
            observations.filter(
              (d): d is MedianObservationFieldsFragment =>
                d.__typename === "MedianObservation"
            ),
            (values) => {
              const d = values[0];
              return {
                id: d.canton,
                label: d.cantonLabel,
                value: d.value,
              };
            },
            (d) => d.canton
          )
        )
      : Array.from(
          rollup(
            observations.filter(
              (d): d is ProviderObservationFieldsFragment =>
                d.__typename === "ProviderObservation"
            ),
            (values) => {
              const d = values[0];
              return {
                id: listState === "PROVIDERS" ? d.provider : d.municipality,
                label:
                  listState === "PROVIDERS"
                    ? d.providerLabel
                    : d.municipalityLabel,
                value: d.value,
              };
            },
            (d) => (listState === "PROVIDERS" ? d.provider : d.municipality)
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
        options={[
          {
            value: "MUNICIPALITIES",
            label: <Trans id="list.municipalities">Gemeinden</Trans>,
          },
          {
            value: "CANTONS",
            label: <Trans id="list.cantons">Kantone</Trans>,
          },
          {
            value: "PROVIDERS",
            label: <Trans id="list.providers">Netzbetreiber</Trans>,
          },
        ]}
        value={listState}
        setValue={setListState}
      />

      <Box
        sx={{
          p: 2,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome300",
        }}
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
        />

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

      <ListItems
        items={listItems}
        colorScale={colorScale}
        listState={listState}
      />
    </>
  );
};
