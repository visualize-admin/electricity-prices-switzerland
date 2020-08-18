import * as React from "react";
import { Trans } from "@lingui/macro";

interface Props {
  elementId: string;
  fileName: string;
}

export const DownloadImage = ({ elementId, fileName }: Props) => {
  const [origin, setOrigin] = React.useState<undefined | string>(undefined);
  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);
  return (
    <a
      href={`${origin}/api/screenshot?url=http://localhost:3000/de/municipality/261&element=${elementId}&download=${fileName}-image`}
    >
      <Trans id="image.download">Bild herunterlden</Trans>
    </a>
  );
};
