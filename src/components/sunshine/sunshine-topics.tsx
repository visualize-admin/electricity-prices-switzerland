import { t, Trans } from "@lingui/macro";
import { Box, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";

import { Icon } from "src/icons";

import { AnchorNav } from "../anchor-nav";

import {
  SunshineCard,
  SunshineCardContent,
  SunshineCardDescription,
  SunshineCardHeader,
  SunshineCardTitle,
  SunshineImageWrapper,
} from "./sunshine-card";

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
            fontFeatureSettings: "'liga' off, 'clig' off",
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
        <Grid container spacing={12}>
          <Grid item xs={12} sm={6} lg={4}>
            <SunshineCard>
              <SunshineCardHeader>
                <SunshineImageWrapper>
                  <Image
                    src="/assets/map-sunshine-default.svg"
                    alt="map preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </SunshineImageWrapper>
              </SunshineCardHeader>

              <SunshineCardContent>
                <Stack direction={"column"} spacing={4} pb={6}>
                  <SunshineCardTitle>
                    <Trans id="home.sunshine-topics.card.costs-and-tariffs.title">
                      Costs and Tariffs
                    </Trans>
                  </SunshineCardTitle>
                  <SunshineCardDescription>
                    <Trans id="home.sunshine-topics.card.costs-and-tariffs.description">
                      Electricity bills consist of energy tariffs and network
                      costs. Network tariffs (levels 5–7) cover infrastructure,
                      grid maintenance, metering, and administrative services,
                      while energy tariffs reflect actual consumption in
                      households (H) or businesses (C).
                    </Trans>
                  </SunshineCardDescription>
                </Stack>
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.network-costs.link",
                    message: "Network Costs",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                />
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.net-tariff.link",
                    message: "Net Tariff",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                />
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.energy-tariff.link",
                    message: "Energy Tariff",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                  hideBorder
                />
              </SunshineCardContent>
            </SunshineCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <SunshineCard>
              <SunshineCardHeader>
                <SunshineImageWrapper>
                  <Image
                    src="/assets/map-sunshine-mountain.svg"
                    alt="map preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </SunshineImageWrapper>
              </SunshineCardHeader>

              <SunshineCardContent>
                <Stack direction={"column"} spacing={4} pb={6}>
                  <SunshineCardTitle>
                    <Trans id="home.sunshine-topics.card.power-stability.title">
                      Power Stability
                    </Trans>
                  </SunshineCardTitle>
                  <SunshineCardDescription>
                    <Trans id="home.sunshine-topics.card.power-stability.description">
                      SAIDI measures the total duration of power outages per
                      customer each year, while SAIFI indicates how often
                      outages occur. Together, they provide key insights into
                      the reliability and stability of the electricity supply
                      over a defined period.
                    </Trans>
                  </SunshineCardDescription>
                </Stack>
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.power-outage-duration.link",
                    message: "Power Outage Duration (SAIDI)",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                />
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.power-outage-frequency.link",
                    message: "Power Outage Frequency (SAIFI)",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                />
              </SunshineCardContent>
            </SunshineCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <SunshineCard>
              <SunshineCardHeader>
                <SunshineImageWrapper>
                  <Image
                    src="/assets/map-sunshine-yes-no.svg"
                    alt="map preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </SunshineImageWrapper>
              </SunshineCardHeader>

              <SunshineCardContent>
                <Stack direction={"column"} spacing={4} pb={6}>
                  <SunshineCardTitle>
                    <Trans id="home.sunshine-topics.card.compliance.title">
                      Compliance
                    </Trans>
                  </SunshineCardTitle>
                  <SunshineCardDescription>
                    <Trans id="home.sunshine-topics.card.compliance.description">
                      Product variety reflects the range of ecological
                      electricity products offered. Service quality captures how
                      well customers are informed about outages. Compliance
                      measures how consistently a grid operator follows laws,
                      regulations, and internal standards.
                    </Trans>
                  </SunshineCardDescription>
                </Stack>
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.product-variety.link",
                    message: "Product Variety",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                />
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.service-quality.link",
                    message: "Service Quality",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                />
                <AnchorNav
                  label={t({
                    id: "home.sunshine-topics.compliance.link",
                    message: "Compliance",
                  })}
                  href={"#"}
                  icon={<Icon name="arrowright" />}
                  hideBorder
                />
              </SunshineCardContent>
            </SunshineCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
