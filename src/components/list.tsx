import { t, Trans } from "@lingui/macro";
import { ScaleThreshold } from "d3";
import { ascending, descending, rollup } from "d3-array";
import { useCallback, useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "theme-ui";
import { useFormatCurrency } from "../domain/helpers";
import { Observation } from "../graphql/queries";
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
  return (
    <LocalizedLink
      pathname={`/[locale]/${
        listState === "MUNICIPALITIES" ? "municipality" : "provider"
      }/[id]`}
      query={{
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
  observations: Observation[];
  colorScale: ScaleThreshold<number, string>;
}

const TRUNCATION_INCREMENT = 20;

const ListItems = ({
  getLabel,
  items,
  colorScale,
  listState,
}: {
  getLabel: (observation: Observation) => string;
  items: [string, Observation][];
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
            label={getLabel(d)}
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

type ListState = "MUNICIPALITIES" | "PROVIDERS";
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

  const getLabel = useCallback(
    (d: Observation) =>
      (listState === "PROVIDERS" ? d.providerLabel : d.municipality) ?? "???",
    [listState]
  );

  const grouped = useMemo(() => {
    return Array.from(
      rollup(
        observations,
        (values) => values[0],
        (d) => (listState === "PROVIDERS" ? d.provider : d.municipality)
      )
    );
  }, [observations, listState]);

  const filtered = useMemo(() => {
    if (searchQuery === "") {
      return grouped;
    }
    const filterRe = new RegExp(`${searchQuery}`, "i");
    return grouped.filter(([k, d]) => getLabel(d).match(filterRe));
  }, [grouped, searchQuery, getLabel]);

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
            value: "PROVIDERS",
            label: <Trans id="list.providers">Netzbetreiber</Trans>,
          },
          {
            value: "MUNICIPALITIES",
            label: <Trans id="list.municipalities">Gemeinden</Trans>,
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
        getLabel={getLabel}
        colorScale={colorScale}
        listState={listState}
      />
    </>
  );
};
