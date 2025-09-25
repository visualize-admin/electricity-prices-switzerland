import { t } from "@lingui/macro";

import { InfoDialogButtonProps } from "src/components/info-dialog";
import { WikiPageSlug } from "src/domain/wiki";

export const infoDialogProps = {
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
} satisfies Partial<Record<WikiPageSlug, InfoDialogButtonProps>>;
