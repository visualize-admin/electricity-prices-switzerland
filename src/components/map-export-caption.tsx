import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { keyBy } from "lodash";

import {
  QueryStateEnergyPricesMap,
  QueryStateSunshineMap,
  useQueryStateEnergyPricesMap,
  useQueryStateMapCommon,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import {
  getLocalizedLabel,
  valueLabels,
  TranslationKey,
} from "src/domain/translation";
import { usePeerGroupsQuery } from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

type MapExportCaptionEnergy = Pick<
  QueryStateEnergyPricesMap,
  "period" | "category" | "priceComponent" | "product"
>;

type MapExportCaptionSunshine = Pick<
  QueryStateSunshineMap,
  | "period"
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
  peerGroupsById?: Partial<Record<string, { name: string }>>;
};

type FilterPart = { label: string; value: string };

const getEnergyFilterParts = (energy: MapExportCaptionEnergy): FilterPart[] => [
  { label: getLocalizedLabel({ id: "period" }), value: energy.period },
  {
    label: getLocalizedLabel({ id: "category" }),
    value: valueLabels.category(energy.category, "short"),
  },
  {
    label: getLocalizedLabel({ id: "priceComponent" }),
    value: valueLabels.priceComponent(energy.priceComponent),
  },
  {
    label: getLocalizedLabel({ id: "product" }),
    value: valueLabels.product(energy.product),
  },
];

const getSunshineFilterParts = (
  sunshine: MapExportCaptionSunshine,
  peerGroupsById: Partial<Record<string, { name: string }>>
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
      value: valueLabels.peerGroup(sunshine.peerGroup, peerGroupsById),
    },
  ];

  if (
    sunshine.indicator === "netTariffs" ||
    sunshine.indicator === "energyTariffs"
  ) {
    parts.push({
      label: getLocalizedLabel({ id: "category" }),
      value: valueLabels.category(sunshine.category, "short"),
    });
  }
  if (sunshine.indicator === "networkCosts") {
    parts.push({
      label: t({ id: "selector.network-level", message: "Network level" }),
      value: valueLabels.networkLevel(sunshine.networkLevel, "short"),
    });
  }
  if (sunshine.indicator === "saidi" || sunshine.indicator === "saifi") {
    parts.push({
      label: t({ id: "selector.saidi-saifi-type", message: "Typology" }),
      value: valueLabels.saidiSaifiType(sunshine.saidiSaifiType),
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

const MapExportCaptionView = ({
  tab,
  energy,
  sunshine,
  peerGroupsById = {},
}: MapExportCaptionProps) => {
  const parts =
    tab === "sunshine" && sunshine
      ? getSunshineFilterParts(sunshine, peerGroupsById)
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

/** Shown only while a map PNG is being composed, so html2canvas includes filters and source. */
export const MapExportCaption = () => {
  const [{ tab }] = useQueryStateMapCommon();
  const [energy] = useQueryStateEnergyPricesMap();
  const [sunshine] = useQueryStateSunshineMap();
  const locale = useLocale();
  const [peerGroupsResult] = usePeerGroupsQuery({
    variables: { locale },
    requestPolicy: "cache-first",
  });
  const peerGroupsById = keyBy(
    peerGroupsResult.data?.peerGroups ?? [],
    (x) => x.id
  );

  return (
    <MapExportCaptionView
      tab={tab}
      energy={energy}
      sunshine={sunshine}
      peerGroupsById={peerGroupsById}
    />
  );
};
