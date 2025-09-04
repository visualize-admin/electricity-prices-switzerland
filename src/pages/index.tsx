const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);
import { Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";

import { MapLink } from "src/components/links";
import { SunshineTopics } from "src/components/sunshine/sunshine-topics";
import { Icon } from "src/icons";
import { defaultLocale } from "src/locales/config";
import { useFlag } from "src/utils/flags";
import { makePageTitle } from "src/utils/page-title";

const ApplicationLayout = dynamic(
  () => import("../components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async ({ locale }) => {
  return {
    props: {
      locale: locale ?? defaultLocale,
    },
  };
};

const IndexPage = () => {
  const isSunshine = useFlag("sunshine");

  return (
    <>
      <Head>
        <title>{makePageTitle()}</title>
      </Head>
      <ApplicationLayout>
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
            <Box
              display={"flex"}
              sx={{
                gap: 12,
                alignItems: "stretch",
                flexDirection: {
                  xxs: "column",
                  md: "row",
                },
              }}
            >
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
                    Discover the electricity tariffs in the map view
                  </Trans>
                </Typography>
                <Typography variant="body1" component={"span"}>
                  <Trans id="home.hero-section.description">
                    This website provides up-to-date information on electricity
                    tariffs in Switzerland and allows you to compare prices for
                    private and commercial customers by municipality, canton or
                    grid operator. You can view detailed breakdowns of energy,
                    grid and additional costs as well as historical trends to
                    better understand the cost of electricity in your region.
                  </Trans>
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    maxWidth: "fit-content",
                  }}
                  color="primary"
                  endIcon={<Icon name="arrowright" />}
                  component={MapLink}
                >
                  <Typography variant="h3">
                    <Trans id="home.hero-section.primary-cta">
                      Electricity tariffs in Switzerland
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
                    src="/assets/map-preview.webp"
                    alt="map preview"
                    layout="fill"
                    objectFit="contain"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </Box>
              </Box>
            </Box>
          </ContentWrapper>
          {isSunshine && (
            <Box
              sx={{
                backgroundColor: "secondary.50",
              }}
            >
              <ContentWrapper
                sx={{
                  py: 20,
                }}
              >
                <SunshineTopics />
              </ContentWrapper>
            </Box>
          )}
        </Box>
      </ApplicationLayout>
    </>
  );
};

export default IndexPage;
