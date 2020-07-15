import { Flex, Box, Text } from "@theme-ui/components";
import { useRouter } from "next/router";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Trans } from "@lingui/macro";
import { LocalizedLink } from "../../../components/links";
import { Link as UILink } from "theme-ui";
import { useObservationsQuery, PriceComponent } from "../../../graphql/queries";
import * as React from "react";

const EMPTY_ARRAY: never[] = [];

const MunicipalityPage = () => {
  const { query } = useRouter();

  const kantonId = "261";
  const providerIds = ["xxx", "yyy"];

  const priceComponent =
    (query.priceComponent as PriceComponent) ?? PriceComponent.Total; // TODO: parameterize priceComponent
  const category = query.category as string;

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        period: ["2020"],
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/H1`,
        ],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  console.log({ observations });

  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          bg: "monochrome200",
          flexDirection: "column",
        }}
      >
        <Box sx={{ px: 4, py: 6, bg: "monochrome100" }}>
          <Box sx={{ maxWidth: "65rem", mx: "auto", my: 2 }}>
            <Text as="h1" variant="heading1" sx={{ color: "monochrome800" }}>
              Municipality {query.id}
            </Text>

            <Flex sx={{ flexWrap: "wrap" }}>
              <Box sx={{ pr: 3, my: 1 }}>
                <Trans id="detail.canton">Kanton</Trans>:{" "}
                <LocalizedLink
                  pathname="/[locale]/canton/[id]"
                  query={{ id: kantonId }}
                  passHref
                >
                  <UILink variant="inline">Kanton</UILink>
                </LocalizedLink>
              </Box>
              <Box sx={{ pr: 3, my: 1 }}>
                <Trans id="detail.municipality">Netzbetrieber</Trans>:{" "}
                {providerIds.map((providerId, i) => (
                  <React.Fragment key={i}>
                    <LocalizedLink
                      pathname="/[locale]/provider/[id]"
                      query={{ id: providerId }}
                      passHref
                    >
                      <UILink variant="inline">{providerId}</UILink>
                    </LocalizedLink>
                    {i < providerIds.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </Box>
            </Flex>
          </Box>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
