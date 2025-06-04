const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);
import { t, Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";

import { SunshineTopics } from "src/components/sunshine/sunshine-topics";
import { Icon } from "src/icons";
import { defaultLocale } from "src/locales/config";
import { useFlag } from "src/utils/flags";

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
        <title>
          {t({
            id: "site.title",
            message: "Electricity tariffs in Switzerland",
          })}
        </title>
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
                    Entdecken Sie die Stromtarife in der Kartenansicht
                  </Trans>
                </Typography>
                <Typography variant="body1" component={"span"}>
                  <Trans id="home.hero-section.description">
                    Diese Website bietet aktuelle Informationen zu den
                    Stromtarifen über die Stromtarife in der Schweiz und
                    ermöglicht den Vergleich der Preise für Privat- und
                    Gewerbekunden nach Gemeinde, Kantonen oder Netzbetreibern
                    vergleichen. Sie können detaillierte Aufschlüsselungen von
                    Energie-, Netz- und Zusatzkosten sowie historische Trends,
                    um die Stromkosten in Ihrer Region besser zu Region.
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
                      Stromtarife in der Schweiz
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
