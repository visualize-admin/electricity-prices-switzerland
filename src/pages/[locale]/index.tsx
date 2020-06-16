import { Trans } from "@lingui/macro";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Box, Flex } from "theme-ui";

export default function IndexPage() {
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Box sx={{ pt: 96, flexGrow: 1 }}>
        <Trans id="test.hello">Hallo</Trans>
      </Box>
      <Footer></Footer>
    </Flex>
  );
}
