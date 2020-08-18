import * as React from "react";
import { Trans } from "@lingui/macro";
import { useLocale } from "../../lib/use-locale";
import { Entity } from "../../domain/data";

interface Props {
  entity?: Entity;
  id?: string;
  elementId: string;
  fileName: string;
}

export const DownloadImage = ({ elementId, fileName, entity, id }: Props) => {
  const locale = useLocale();
  const [origin, setOrigin] = React.useState<undefined | string>(undefined);
  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);

  // FIXME: use encodeURIComponent
  const url =
    entity && id
      ? `${origin}/api/screenshot?url=${origin}/${locale}/${entity}/${id}&element=${elementId}&download=${fileName}-image`
      : `${origin}/api/screenshot?url=${origin}/${locale}&element=${elementId}&download=${fileName}-image`;

  return (
    <a href={url}>
      <Trans id="image.download">Bild herunterlden</Trans>
    </a>
  );
};
