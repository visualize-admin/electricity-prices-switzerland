import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";

import {
  QueryStateEnergyPricesMap,
  QueryStateSunshineMap,
} from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";

type MapExportCaptionEnergy = Pick<
  QueryStateEnergyPricesMap,
  "period" | "category" | "priceComponent" | "product"
>;

type MapExportCaptionSunshine = Pick<
  QueryStateSunshineMap,
  | "period"Ÿ
  | "indicator"
  | "peerGroup"
  | "category"
  | "networkLevel"
  | "saidiSaifiType"
>;

type MapExportCaptionProps = {
  tab: "electricity" | "sunshine";
  energy?: MapExportCaptionEnergy;
  sunshine?: MapExportCaptionSunshine;
};

type FilterPart = { label: string; value: string };

const getEnergyFilterParts = (energy: MapExportCaptionEnergy): FilterPart[] => [
  { label: getLocalizedLabel({ id: "period" }), value: energy.period },
  {
    label: getLocalizedLabel({ id: "category" }),
    value: getLocalizedLabel({ id: energy.category }),
  },
  {
    label: getLocalizedLabel({ id: "priceComponent" }),
    value: getLocalizedLabel({ id: energy.priceComponent }),
  },
  {
    label: getLocalizedLabel({ id: "product" }),
    value: getLocalizedLabel({ id: energy.product }),
  },
];

const getSunshineFilterParts = (
  sunshine: MapExportCaptionSunshine
): FilterPart[] => {
  const parts: FilterPart[] = [
    { label: getLocalizedLabel({ id: "period" }), value: sunshine.period },
    {
      label: t({ id: "selector.indicator", message: "Indicator" }),
      value: getLocalizedLabel({
        id: `selector.indicator.${sunshine.indicator}.long` as TranslationKey,
      }),
    },
    {
      label: t({ id: "selector.peerGroup", message: "Peer Group" }),
      value:
        sunshine.peerGroup === "all_grid_operators"
          ? getLocalizedLabel({ id: "peer-group.all-grid-operators" })
          : sunshine.peerGroup,
    },
  ];

  if (
    sunshine.indicator === "netTariffs" ||
    sunshine.indicator === "energyTariffs"
  ) {
    parts.push({
      label: getLocalizedLabel({ id: "category" }),
      value: getLocalizedLabel({ id: sunshine.category }),
    });
  }
  if (sunshine.indicator === "networkCosts") {
    parts.push({
      label: t({ id: "selector.network-level", message: "Network level" }),
      value: getLocalizedLabel({
        id: `network-level.${sunshine.networkLevel}.short`,
      }),
    });
  }
  if (sunshine.indicator === "saidi" || sunshine.indicator === "saifi") {
    parts.push({
      label: t({ id: "selector.saidi-saifi-type", message: "Typology" }),
      value: getLocalizedLabel({ id: sunshine.saidiSaifiType }),
    });
  }

  return parts;
};

const FilterParts = ({ parts }: { parts: FilterPart[] }) => (
  <>
    {parts.map((part, i) => (
      <span key={part.label}>
        {part.label}: {part.value}
        {i < parts.length - 1 ? ", " : null}
      </span>
    ))}
  </>
);

/** Shown only while a map PNG is being composed, so html2canvas includes filters and source. */
export const MapExportCaption = ({
  tab,
  energy,
  sunshine,
}: MapExportCaptionProps) => {
  const parts =
    tab === "sunshine" && sunshine
      ? getSunshineFilterParts(sunshine)
      : tab === "electricity" && energy
      ? getEnergyFilterParts(energy)
      : [];

  const source = "ElCom";

  return (
    <Box
      mt={2}
      bgcolor="background.paper"
      borderRadius={1}
      px={4}
      py={3}
      boxShadow={1}
      maxWidth={247}
      sx={{ overflowWrap: "anywhere" }}
    >
      <Typography
        variant="inherit"
        fontSize="0.625rem"
        lineHeight={1.25}
        component="p"
        display="block"
      >
        <FilterParts parts={parts} />
      </Typography>
      <Typography
        variant="inherit"
        fontSize="0.625rem"
        component="p"
        display="block"
        mt={1}
      >
        <Trans id="sunshine.source">Source: {source}</Trans>
      </Typography>
    </Box>
  );
};
