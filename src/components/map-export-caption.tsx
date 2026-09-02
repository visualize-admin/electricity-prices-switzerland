import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";

import { FilterSetDescription } from "src/components/detail-page/filter-set-description";
import {
  useQueryStateEnergyPricesMap,
  useQueryStateMapCommon,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";

const FilterParts = ({
  parts,
}: {
  parts: { label: string; value: string }[];
}) => (
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
export const MapExportCaption = () => {
  const [{ tab }] = useQueryStateMapCommon();
  const [energy] = useQueryStateEnergyPricesMap();
  const [sunshine] = useQueryStateSunshineMap();

  const sunshineParts = [
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
    sunshineParts.push({
      label: getLocalizedLabel({ id: "category" }),
      value: getLocalizedLabel({ id: sunshine.category }),
    });
  }
  if (sunshine.indicator === "networkCosts") {
    sunshineParts.push({
      label: t({ id: "selector.network-level", message: "Network level" }),
      value: getLocalizedLabel({
        id: `network-level.${sunshine.networkLevel}.short`,
      }),
    });
  }
  if (sunshine.indicator === "saidi" || sunshine.indicator === "saifi") {
    sunshineParts.push({
      label: t({ id: "selector.saidi-saifi-type", message: "Typology" }),
      value: getLocalizedLabel({ id: sunshine.saidiSaifiType }),
    });
  }

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
        variant="caption"
        fontSize="0.625rem"
        component="p"
        display="block"
      >
        {tab === "sunshine" ? (
          <FilterParts parts={sunshineParts} />
        ) : (
          <FilterSetDescription
            filters={{
              period: energy.period,
              category: energy.category,
              priceComponent: energy.priceComponent,
              product: energy.product,
            }}
          />
        )}
      </Typography>
      <Typography
        variant="caption"
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
