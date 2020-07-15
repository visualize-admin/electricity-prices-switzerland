import { Flex, Box, Text } from "@theme-ui/components";
import { useRouter } from "next/router";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Trans } from "@lingui/macro";
import { LocalizedLink } from "../../../components/links";
import { Link as UILink } from "theme-ui";

const MunicipalityPage = () => {
  const { id } = useRouter().query;
  const kantonId = "261";
  const providerIds = ["xxx", "yyy"];
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
              Municipality {id}
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
                  <>
                    <LocalizedLink
                      pathname="/[locale]/provider/[id]"
                      query={{ id: providerId }}
                      passHref
                    >
                      <UILink variant="inline">{providerId}</UILink>
                    </LocalizedLink>
                    {i < providerIds.length - 1 && ", "}
                  </>
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
