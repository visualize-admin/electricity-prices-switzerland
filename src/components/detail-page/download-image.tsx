import * as React from "react";
import { Trans } from "@lingui/macro";
import { useLocale } from "../../lib/use-locale";
import { Entity } from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";
import { useRouter } from "next/router";
import { Link as TUILink } from "@theme-ui/components";

export type DownloadChart =
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
  chart: DownloadChart;
}

export const DownloadImage = ({
  elementId,
  fileName,
  entity,
  id,
  chart,
}: Props) => {
  const locale = useLocale();
  const [{ period, category, product }] = useQueryState();
  const { query, replace, pathname } = useRouter();

  const [origin, setOrigin] = React.useState<undefined | string>(undefined);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);

  const params = `${period.reduce(
    (acc, cur, i) => acc.concat(`${i > 0 ? "&" : ""}period=${cur}`),
    ""
  )}`;
  const url = `${origin}/${locale}/${entity}/${id}?chart=${chart}`;

  // FIXME: use encodeURIComponent
  const downLoadUrl =
    entity && id && chart !== "map"
      ? `${origin}/api/screenshot?url=${url}&element=${elementId}&download=${fileName}-image&deviceScaleFactor=1.5`
      : // Map
        `${origin}/api/screenshot?url=${origin}/${locale}&element=${elementId}&download=${fileName}-image&deviceScaleFactor=1.5`;

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
