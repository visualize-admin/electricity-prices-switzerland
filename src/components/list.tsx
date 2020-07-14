import { Grid, Box, Text, Button, Flex } from "theme-ui";
import { useLocale } from "../lib/use-locale";
import { Fragment, useState, useMemo } from "react";
import { Icon } from "../icons";
import { Observation } from "../graphql/queries";
import { group, rollup, ascending, descending } from "d3-array";
import { ScaleThreshold } from "d3";
import { useFormatNumber, useFormatCurrency } from "../domain/helpers";
import { Trans } from "@lingui/macro";

const ListItem = ({
  id,
  label,
  value,
  colorScale,
  formatNumber,
}: {
  id: string;
  label: string;
  value: number;
  colorScale: (d: number) => string;
  formatNumber: (d: number) => string;
}) => {
  return (
    <Flex
      key={id}
      sx={{
        py: 1,
        px: 2,
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "monochrome300",
        alignItems: "center",
        height: "3.5rem",
        lineHeight: 1,
      }}
    >
      <Text variant="meta">{label}</Text>
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
  );
};

interface Props {
  observations: Observation[];
  colorScale: ScaleThreshold<number, string>;
}

type ListState = "MUNICIPALITIES" | "PROVIDERS";
type SortState = "ASC" | "DESC";

const TRUNCATION_INCREMENT = 20;

export const List = ({ observations, colorScale }: Props) => {
  const locale = useLocale();

  const [listState, setListState] = useState<ListState>("MUNICIPALITIES");
  const [sortState, setSortState] = useState<SortState>("ASC");
  const [truncated, setTruncated] = useState<number>(TRUNCATION_INCREMENT);

  const formatNumber = useFormatCurrency();

  const grouped = useMemo(() => {
    console.log(observations);
    return Array.from(
      rollup(
        observations,
        (values) => values[0],
        (d) => (listState === "PROVIDERS" ? d.provider : d.municipality)
      )
    );
  }, [observations, listState]);

  const sorted = useMemo(() => {
    return [...grouped].sort(([, a], [, b]) => {
      return sortState === "ASC"
        ? ascending(a.value, b.value)
        : descending(a.value, b.value);
    });
  }, [grouped, sortState]);

  const listItems = truncated ? sorted.slice(0, truncated) : sorted;

  return (
    <Box>
      <Box sx={{}}>
        {listItems.map(([id, d]) => {
          return (
            <ListItem
              id={id}
              value={d.value}
              label={id}
              colorScale={colorScale}
              formatNumber={formatNumber}
            />
          );
        })}
      </Box>

      {truncated && (
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "monochrome300",
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
