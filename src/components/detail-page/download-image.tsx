import * as React from "react";
import { Trans } from "@lingui/macro";
import { useLocale } from "../../lib/use-locale";
import { Entity } from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";

import { Link as TUILink, Box, Text } from "@theme-ui/components";
import { useRouter } from "next/router";

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

  const queryParams = `download=${downloadType}${municipalities}${operators}${cantons}${periods}&category=${category}&product=${product}&priceComponent=${priceComponent}`;

  const url =
    entity && id && downloadType !== "map"
      ? `${origin}/${locale}/${entity}/${id}?${queryParams}`
      : `${origin}/${locale}?${queryParams}`;

  const downLoadUrl = `${origin}/api/screenshot?url=${encodeURIComponent(
    url
  )}&element=${elementId}&filename=${fileName}&deviceScaleFactor=2`;

  return (
    <Box sx={{ mt: 4 }}>
      {!download ? (
        <TUILink
          variant="inline"
          href={downLoadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans id="image.download">Bild herunterladen</Trans>
        </TUILink>
      ) : (
        <Text variant="meta" sx={{ mt: 4 }}>
          <Trans id="image.download.source">
            Eidgenössische Elektrizitätskommission ElCom
          </Trans>{" "}
          - <Trans id="image.download.unit">Tarifvergleich in Rp./kWh</Trans>
        </Text>
      )}
    </Box>
  );
};
