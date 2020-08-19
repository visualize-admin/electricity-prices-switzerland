import * as React from "react";
import { Trans } from "@lingui/macro";
import { useLocale } from "../../lib/use-locale";
import { Entity } from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";
import { useRouter } from "next/router";
import { Link as TUILink } from "@theme-ui/components";

export type Download =
  | "map"
  | "components"
  | "evolution"
  | "distribution"
  | "comparison";

interface Props {
  entity?: Entity;
  id?: string;
  elementId: string;
  fileName: string;
  download: Download;
}

export const DownloadImage = ({
  elementId,
  fileName,
  entity,
  id,
  download,
}: Props) => {
  const locale = useLocale();
  const [
    { period, category, product, municipality, provider, canton },
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
  const providers = constructParamsFromArray(provider, "provider");
  const cantons = constructParamsFromArray(canton, "canton");

  const queryParams = `download=${download}${municipalities}${providers}${cantons}&category=${category}&product=${product}&${periods}`;

  const url =
    entity && id && download !== "map"
      ? `${origin}/${locale}/${entity}/${id}?${queryParams}`
      : `${origin}/${locale}?${queryParams}`;

  const downLoadUrl = `${origin}/api/screenshot?url=${encodeURIComponent(
    url
  )}&element=${elementId}&filename=${fileName}-image&deviceScaleFactor=2`;

  return (
    <TUILink
      variant="inline"
      href={downLoadUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Trans id="image.download">Bild herunterladen</Trans>
    </TUILink>
  );
};
