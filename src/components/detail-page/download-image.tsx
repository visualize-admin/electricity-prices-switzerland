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
  const [{ period, category, product }] = useQueryState();
  const { query, replace, pathname } = useRouter();

  const [origin, setOrigin] = React.useState<undefined | string>(undefined);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);

  const years = `${period.reduce(
    (acc, cur, i) => acc.concat(`period=${cur}`),
    ""
  )}`;

  const url = encodeURIComponent(
    `${origin}/${locale}/${entity}/${id}?download=${download}&category=${category}&product=${product}&${years}`
  );

  const downLoadUrl =
    entity && id && download !== "map"
      ? `${origin}/api/screenshot?url=${url}&element=${elementId}&download=${fileName}-image&deviceScaleFactor=2`
      : // Map
        `${origin}/api/screenshot?url=${origin}/${locale}&element=${elementId}&download=${fileName}-image&deviceScaleFactor=2`;

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
