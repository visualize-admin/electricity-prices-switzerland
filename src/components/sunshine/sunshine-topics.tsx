import { t, Trans } from "@lingui/macro";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";

import { sunshineMapLink } from "src/domain/query-states";
import { SunshineIndicator } from "src/domain/sunshine";
import { Icon } from "src/icons";

import { AnchorNav } from "../anchor-nav";

import {
  SunshineCard,
  SunshineCardContent,
  SunshineCardDescription,
  SunshineCardGrid,
  SunshineCardHeader,
  SunshineCardLinks,
  SunshineCardTitle,
  SunshineImageWrapper,
} from "./sunshine-card";

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
  title: {
    id: string;
    message: string;
  };
  description: {
    id: string;
    message: string;
  };
  links: TopicLink[];
}

const sunshineTopics: SunshineTopic[] = [
  {
    id: "costs-and-tariffs",
    image: {
      src: "/assets/map-sunshine-networkCosts.webp",
      alt: "map preview",
    },
    title: {
      id: "home.sunshine-topics.card.costs-and-tariffs.title",
      message: "Costs and Tariffs",
    },
    description: {
      id: "home.sunshine-topics.card.costs-and-tariffs.description",
      message:
        "Electricity bills consist of energy tariffs and network costs. Network tariffs (levels 5-7) cover infrastructure, grid maintenance, metering, and administrative services, while energy tariffs reflect actual consumption in households (H) or businesses (C).",
    },
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
    title: {
      id: "home.sunshine-topics.card.power-stability.title",
      message: "Power Stability",
    },
    description: {
      id: "home.sunshine-topics.card.power-stability.description",
      message:
        "SAIDI measures the total duration of power outages per customer each year, while SAIFI indicates how often outages occur. Together, they provide key insights into the reliability and stability of the electricity supply over a defined period.",
    },
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
    title: {
      id: "home.sunshine-topics.card.compliance.title",
      message: "Compliance",
    },
    description: {
      id: "home.sunshine-topics.card.compliance.description",
      message:
        "Service quality captures how well customers are informed about outages. Compliance measures how consistently a grid operator follows laws, regulations, and internal standards.",
    },
    links: [
      {
        label: t({
          id: "home.sunshine-topics.service-quality.link",
          message: "Service Quality",
        }),
        indicator: "outageInfo",
      },
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
  return (
    <Box
      sx={{
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
      display={"flex"}
    >
      <Box
        sx={{
          flexDirection: "column",
          gap: 4,
          width: "100%",
        }}
        display={"flex"}
      >
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
      <Box
        sx={{
          flexDirection: "column",
          gap: 10,
        }}
        display={"flex"}
      >
        <Typography variant="h2" fontWeight={700} component={"h3"}>
          <Trans id="home.sunshine-topics.title">Sunshine Topics</Trans>
        </Typography>
        <SunshineCardGrid>
          {sunshineTopics.map((topic) => (
            <SunshineCard key={topic.id}>
              <SunshineCardHeader>
                <SunshineImageWrapper>
                  <Image
                    src={topic.image.src}
                    alt={topic.image.alt}
                    layout="fill"
                    objectFit="contain"
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </SunshineImageWrapper>
              </SunshineCardHeader>

              <SunshineCardContent>
                <Stack direction={"column"} spacing={4}>
                  <SunshineCardTitle>
                    <Trans id={topic.title.id}>{topic.title.message}</Trans>
                  </SunshineCardTitle>
                  <SunshineCardDescription>
                    <Trans id={topic.description.id}>
                      {topic.description.message}
                    </Trans>
                  </SunshineCardDescription>
                </Stack>
                <SunshineCardLinks>
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
                </SunshineCardLinks>
              </SunshineCardContent>
            </SunshineCard>
          ))}
        </SunshineCardGrid>
      </Box>
    </Box>
  );
};
