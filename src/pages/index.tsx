import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { t, Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";

import { Icon } from "src/icons";

import { defaultLocale } from "src/locales/locales";

import { ApplicationLayout } from "./app-layout";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async ({ locale, req, res }) => {
  await basicAuthMiddleware(req, res);

  return {
    props: {
      locale: locale ?? defaultLocale,
    },
  };
};

const IndexPage = ({ locale }: Props) => {
  return (
    <>
      <Head>
        <title>{t({ id: "site.title" })}</title>
      </Head>
      <ApplicationLayout locale={locale}>
        <Box
          sx={{
            flexDirection: "column",
          }}
          display="flex"
        >
          <ContentWrapper
            sx={{
              py: 20,
            }}
          >
            <Box display={"flex"} sx={{ gap: 12, alignItems: "stretch" }}>
              <Box
                sx={{
                  width: "100%",
                  flexDirection: "column",
                  gap: 8,
                }}
                display={"flex"}
              >
                <Typography variant="h1" component={"h2"}>
                  <Trans id="home.hero-section.title">
                    Discover the Electricity Tariffs in the Map View
                  </Trans>
                </Typography>
                <Typography variant="body1" component={"span"}>
                  <Trans id="home.hero-section.title">
                    This site provides up-to-date information on electricity
                    tariffs across Switzerland, allowing you to compare prices
                    for residential and commercial customers by municipality,
                    canton, or grid operator. Explore detailed breakdowns of
                    energy, network, and additional charges, and view historical
                    trends to better understand electricity costs in your
                    region.
                  </Trans>
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    maxWidth: "fit-content",
                  }}
                  color="primary"
                  endIcon={<Icon name="arrowright" />}
                  href="/map"
                >
                  <Typography variant="h3">
                    <Trans id="home.hero-section.primary-cta">
                      Electricity Tariffs in Switzerland
                    </Trans>
                  </Typography>
                </Button>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  position: "relative",
                  display: "flex",
                  aspectRatio: "1.5",
                  p: 8,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                  }}
                >
                  <Image
                    src="/assets/map-preview.svg"
                    alt="map preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </Box>
              </Box>
            </Box>
          </ContentWrapper>
        </Box>
      </ApplicationLayout>
    </>
  );
};

export default IndexPage;
