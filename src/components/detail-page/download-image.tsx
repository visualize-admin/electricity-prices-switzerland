import { Trans } from "@lingui/macro";
import { Link as MUILink, Box, Typography } from "@mui/material";
import * as React from "react";

import { useLocale } from "src/lib/use-locale";
import { useQueryState } from "src/lib/use-query-state";

import { Entity } from "../../domain/data";

export type Download =
  | "map"
  | "components"
  | "evolution"
  | "distribution"
  | "comparison";

interface Props {
  entity?: Entity;
  id?: string;
  elementId: Download;
  fileName: string;
  downloadType: Download;
}

export const DownloadImage = ({
  elementId,
  fileName,
  entity,
  id,
  downloadType,
}: Props) => {
  const locale = useLocale();
  const [
    {
      period,
      category,
      product,
      priceComponent,
      municipality,
      operator,
      canton,
      download,
      cantonsOrder,
      view,
    },
  ] = useQueryState();

  const [origin, setOrigin] = React.useState<undefined | string>(undefined);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);

  const constructParamsFromArray = (
    param: string[] | undefined,
    paramName: string
  ): string =>
    param
      ? `${param.reduce((acc, cur) => acc.concat(`&${paramName}=${cur}`), "")}`
      : "";

  const periods = constructParamsFromArray(period, "period");
  const municipalities = constructParamsFromArray(municipality, "municipality");
  const operators = constructParamsFromArray(operator, "operator");
  const cantons = constructParamsFromArray(canton, "canton");

  const queryParams = `download=${downloadType}${municipalities}${operators}${cantons}${periods}&category=${category}&product=${product}&priceComponent=${priceComponent}&cantonsOrder=${cantonsOrder}&view=${view}`;

  const url =
    entity && id && downloadType !== "map"
      ? `${origin}/${locale}/${entity}/${id}?${queryParams}`
      : `${origin}/${locale}?${queryParams}`;

  const downLoadUrl = `${origin}/api/screenshot?url=${encodeURIComponent(
    url
  )}&element=${elementId}&filename=${fileName}&deviceScaleFactor=2`;

  return (
    <Box>
      {!download ? (
        <MUILink
          variant="inline"
          href={downLoadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans id="image.download">Bild herunterladen</Trans>
        </MUILink>
      ) : (
        <Typography variant="meta" sx={{ mt: 4 }}>
          <Trans id="image.download.source">
            Eidgenössische Elektrizitätskommission ElCom
          </Trans>{" "}
          -<Trans id="image.download.unit">Tarifvergleich in Rp./kWh</Trans>
        </Typography>
      )}
    </Box>
  );
};
