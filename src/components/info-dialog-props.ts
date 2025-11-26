import { t } from "@lingui/macro";

import { InfoDialogButtonProps } from "src/components/info-dialog";
import { WikiPageSlug } from "src/domain/types";

export const infoDialogProps = () =>
  ({
    "help-network-costs": {
      slug: "help-network-costs",
      label: t({
        id: "sunshine.costs-and-tariffs.network-cost-trend",
        message: "Network Cost Trend",
      }),
    },
    "help-energy-tariffs": {
      slug: "help-energy-tariffs",
      label: t({
        id: "sunshine.costs-and-tariffs.energy-tariffs-trend",
        message: "Energy Tariffs Trend",
      }),
    },
    "help-net-tariffs": {
      slug: "help-net-tariffs",
      label: t({
        id: "sunshine.costs-and-tariffs.net-tariffs-trend",
        message: "Net Tariffs Trend",
      }),
    },
    "help-saidi": {
      slug: "help-saidi",
      label: t({
        id: "sunshine.power-stability.saidi.info-dialog-label",
        message: "Total Outage Duration",
      }),
    },
    "help-saifi": {
      slug: "help-saifi",
      label: t({
        id: "sunshine.power-stability.saifi.info-dialog-label",
        message: "Total Outage Frequency",
      }),
    },
    "help-compliance": {
      slug: "help-compliance",
      label: t({
        id: "sunshine.operational-standards.compliance.info-dialog-label",
        message: "Compliance",
      }),
    },
    "help-service-quality": {
      slug: "help-service-quality",
      label: t({
        id: "sunshine.operational-standards.service-quality.info-dialog-label",
        message: "Service Quality",
      }),
    },
    "help-outageInfo": {
      slug: "help-outageInfo",
      label: t({
        id: "sunshine.operational-standards.outage-info.info-dialog-label",
        message: "Outage Information",
      }),
    },
  } satisfies Partial<Record<WikiPageSlug, InfoDialogButtonProps>>);

export const getInfoDialogProps = <
  K extends keyof ReturnType<typeof infoDialogProps>
>(
  slug: K
): ReturnType<typeof infoDialogProps>[K] => {
  const res = infoDialogProps()[slug];
  if (!res) {
    throw new Error(`Info dialog props not found for slug: ${slug}`);
  }
  return res;
};
