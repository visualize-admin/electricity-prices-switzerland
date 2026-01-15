import { Trans } from "@lingui/macro";
import { Card, CardContent, CardProps, Typography } from "@mui/material";

import CardSource from "src/components/card-source";
import { PeerGroup } from "src/domain/sunshine";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";
import { OperationalStandardsData } from "src/graphql/resolver-types";
import { lowercase } from "src/utils/str";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { NoDataAvailable } from "./no-data-available";
import {
  ComplianceChart,
  ServiceQualityChart,
} from "./operational-standards-chart";

type AttributeProps =
  | {
      attribute: "serviceQuality";
      operationalStandards: OperationalStandardsData["serviceQuality"];
    }
  | {
      attribute: "compliance";
      operationalStandards: OperationalStandardsData["compliance"];
    };

type OperationalStandardsCardProps = AttributeProps & {
  peerGroup: PeerGroup;
  updateDate: string;
  operatorId: string;
  operatorLabel: string;
  /** When true, shows NoDataAvailable instead of the chart */
  noData?: boolean;
} & CardProps;

const DOWNLOAD_ID: Download = "operational-standards";

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
    noData,
    ...rest
  } = props;

  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  return (
    <Card {...rest} id={DOWNLOAD_ID}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              <DownloadImage
                iconOnly
                iconSize={24}
                elementId={DOWNLOAD_ID}
                fileName={DOWNLOAD_ID}
                downloadType={DOWNLOAD_ID}
              />
            </>
          }
        >
          <Typography variant="h3">
            {getLocalizedLabel({
              id: `${lowercase(attribute)}-trend`,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
              Benchmarking within the Peer Group: {peerGroupLabel}
            </Trans>
          </Typography>
        </CardHeader>

        {/* Stacked Horizontal Bar Chart */}
        {noData ? (
          <NoDataAvailable sx={{ mt: 8 }} />
        ) : (
          (() => {
            switch (attribute) {
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
              default: {
                const _exhaustiveCheck: never = attribute;
                return _exhaustiveCheck;
              }
            }
          })()
        )}
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default OperationalStandardsCard;
