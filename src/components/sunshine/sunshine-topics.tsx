import { t, Trans } from "@lingui/macro";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { makeStyles } from "tss-react/mui";

import { sunshineMapLink } from "src/domain/query-states";
import { SunshineIndicator } from "src/domain/sunshine";
import { Icon } from "src/icons";

import { AnchorNav } from "../anchor-nav";

interface TopicLink {
  label: string;
  indicator: SunshineIndicator;
  hideBorder?: boolean;
}

interface SunshineTopic {
  id: string;
  image: {
    src: string;
    alt: string;
  };
  title: string;
  description: string;
  links: TopicLink[];
}

const useStyles = makeStyles()((theme) => ({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: theme.spacing(8),
    // Define grid template rows for consistent alignment
    gridTemplateRows: "auto auto auto",
  },
  card: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    display: "grid",
    // Use subgrid to align with parent grid rows
    gridTemplateRows: "subgrid",
    gridRow: "span 3",
    height: "fit-content",
  },
  header: {
    padding: theme.spacing(6.5, 6),
  },
  content: {
    padding: theme.spacing(0, 6.5, 6.5, 6.5),
    gridTemplateRows: "subgrid",
    gridRow: "span 3",
    display: "grid",
    gap: theme.spacing(6),
  },
  linksContainer: {},
  imageWrapper: {
    width: "100%",
    position: "relative",
    display: "flex",
    aspectRatio: "1.5",
  },
  imageInner: {
    flex: 1,
  },
}));

// Use a function to lazy evaluate the topics for i18n
const sunshineTopics: () => SunshineTopic[] = () => [
  {
    id: "costs-and-tariffs",
    image: {
      src: "/assets/map-sunshine-networkCosts.webp",
      alt: "map preview",
    },
    title: t({
      id: "home.sunshine-topics.card.costs-and-tariffs.title",
      message: "Costs and Tariffs",
    }),
    description: t({
      id: "home.sunshine-topics.card.costs-and-tariffs.description",
      message:
        "Electricity bills consist of energy tariffs and network costs. Network tariffs (levels 5-7) cover infrastructure, grid maintenance, metering, and administrative services, while energy tariffs reflect actual consumption in households (H) or businesses (C).",
    }),
    links: [
      {
        label: t({
          id: "home.sunshine-topics.network-costs.link",
          message: "Network Costs",
        }),
        indicator: "networkCosts",
      },
      {
        label: t({
          id: "home.sunshine-topics.net-tariff.link",
          message: "Net Tariffs",
        }),
        indicator: "netTariffs",
      },
      {
        label: t({
          id: "home.sunshine-topics.energy-tariff.link",
          message: "Energy Tariffs",
        }),
        indicator: "energyTariffs",
      },
    ],
  },
  {
    id: "power-stability",
    image: {
      src: "/assets/map-sunshine-saidi.webp",
      alt: "map preview",
    },
    title: t({
      id: "home.sunshine-topics.card.power-stability.title",
      message: "Power Stability",
    }),
    description: t({
      id: "home.sunshine-topics.card.power-stability.description",
      message:
        "SAIDI measures the total duration of power outages per customer each year, while SAIFI indicates how often outages occur. Together, they provide key insights into the reliability and stability of the electricity supply over a defined period.",
    }),
    links: [
      {
        label: t({
          id: "home.sunshine-topics.power-outage-duration.link",
          message: "Power Outage Duration (SAIDI)",
        }),
        indicator: "saidi",
      },
      {
        label: t({
          id: "home.sunshine-topics.power-outage-frequency.link",
          message: "Power Outage Frequency (SAIFI)",
        }),
        indicator: "saifi",
      },
    ],
  },
  {
    id: "compliance",
    image: {
      src: "/assets/map-sunshine-compliance.webp",
      alt: "map preview",
    },
    title: t({
      id: "home.sunshine-topics.card.compliance.title",
      message: "Compliance",
    }),
    description: t({
      id: "home.sunshine-topics.card.compliance.description",
      message:
        "Service quality captures how well customers are informed about outages. Compliance measures how consistently a grid operator follows laws, regulations, and internal standards.",
    }),
    links: [
      {
        label: t({
          id: "home.sunshine-topics.compliance.link",
          message: "Compliance",
        }),
        indicator: "compliance",
      },
    ],
  },
];

export const SunshineTopics = () => {
  const { classes } = useStyles();

  return (
    <Box display={"flex"} flexDirection="column" gap={20} width="100%">
      <Box display={"flex"} flexDirection="column" gap={4} width="100%">
        <Typography variant="h1" component={"h2"}>
          <Trans id="home.sunshine-regulation.title">
            The Sunshine Regulation
          </Trans>
        </Typography>
        <Typography
          variant="body2"
          component={"span"}
          sx={{
            maxWidth: "880px",
            alignSelf: "stretch",
          }}
        >
          <Trans id="home.sunshine-regulation.description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum.
          </Trans>
        </Typography>
      </Box>
      <Box display={"flex"} flexDirection="column" gap={10}>
        <Typography variant="h2" fontWeight={700} component={"h3"}>
          <Trans id="home.sunshine-topics.title">Sunshine Topics</Trans>
        </Typography>
        <div className={classes.grid}>
          {sunshineTopics().map((topic) => (
            <div key={topic.id} className={classes.card}>
              <div className={classes.header}>
                <div className={classes.imageWrapper}>
                  <div className={classes.imageInner}>
                    <Image
                      src={topic.image.src}
                      alt={topic.image.alt}
                      layout="fill"
                      objectFit="contain"
                      priority={false}
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                </div>
              </div>

              <div className={classes.content}>
                <Stack direction={"column"} spacing={4}>
                  <Typography
                    fontWeight={700}
                    component={"h4"}
                    lineHeight={1.4}
                    variant="h3"
                  >
                    {topic.title}
                  </Typography>
                  <Typography variant="body2">{topic.description}</Typography>
                </Stack>
                <div className={classes.linksContainer}>
                  {topic.links.map((link, index) => (
                    <AnchorNav
                      key={`${link.indicator}-${index}`}
                      label={link.label}
                      href={sunshineMapLink("/map", {
                        tab: "sunshine",
                        indicator: link.indicator,
                      })}
                      icon={<Icon name="arrowright" />}
                      hideBorder={
                        index === topic.links.length - 1
                          ? true
                          : link.hideBorder
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Box>
    </Box>
  );
};
