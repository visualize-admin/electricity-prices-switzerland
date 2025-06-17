import { Trans } from "@lingui/macro";
import { Box, Card, CardContent, CardProps, Typography } from "@mui/material";

import CardSource from "src/components/card-source";
import { PeerGroup, SunshineOperationalStandardsData } from "src/domain/data";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import {
  ComplianceChart,
  ProductVarietyChart,
  ServiceQualityChart,
} from "./operational-standards-chart";
type AttributeProps =
  | {
      attribute: "productVariety";
      operationalStandards: SunshineOperationalStandardsData["productVariety"];
    }
  | {
      attribute: "serviceQuality";
      operationalStandards: SunshineOperationalStandardsData["serviceQuality"];
    }
  | {
      attribute: "compliance";
      operationalStandards: SunshineOperationalStandardsData["compliance"];
    };

type OperationalStandardsCardProps = AttributeProps & {
  peerGroup: PeerGroup;
  updateDate: string;
  operatorId: string;
  operatorLabel: string;
} & CardProps;

const OperationalStandardsCard: React.FC<OperationalStandardsCardProps> = (
  props
) => {
  const {
    peerGroup,
    updateDate,
    operationalStandards,
    operatorId,
    operatorLabel,
    attribute,
  } = props;

  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          {getLocalizedLabel({
            id: `${attribute.toLowerCase()}-trend`,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom mb={8}>
          <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
            Benchmarking within the Peer Group: {peerGroupLabel}
          </Trans>
        </Typography>

        {/* Stacked Horizontal Bar Chart */}
        <Box sx={{ height: 400, width: "100%" }}>
          {(() => {
            switch (attribute) {
              case "productVariety":
                return (
                  <ProductVarietyChart
                    data={operationalStandards}
                    id={operatorId}
                    operatorLabel={operatorLabel}
                  />
                );
              case "serviceQuality":
                return (
                  <ServiceQualityChart
                    data={operationalStandards}
                    id={operatorId}
                    operatorLabel={operatorLabel}
                  />
                );
              case "compliance":
                return (
                  <ComplianceChart
                    data={operationalStandards}
                    id={operatorId}
                    operatorLabel={operatorLabel}
                  />
                );
              default:
                const _exhaustiveCheck: never = attribute;
                return _exhaustiveCheck;
            }
          })()}
        </Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default OperationalStandardsCard;
