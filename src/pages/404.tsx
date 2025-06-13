import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Trans } from "@lingui/macro";
import { Box, Link, Typography } from "@mui/material";

import { ApplicationLayout } from "src/components/app-layout";

const ErrorPage = () => {
  return (
    <ApplicationLayout notFound>
      <ContentWrapper
        sx={{
          py: 20,
        }}
      >
        <Box
          sx={{
            flexDirection: "column",
            gap: 8,
            marginX: "auto",
          }}
          display="flex"
        >
          <Typography
            variant="h1"
            component={"h1"}
            fontWeight={800}
            lineHeight={1.3}
          >
            <Trans id="error.page.404.title">Page not found</Trans>
          </Typography>
          <Typography variant="h3" component={"h3"} lineHeight={1.6}>
            <Trans id="error.page.404.type">Error 404</Trans>
          </Typography>
          <Typography
            variant="h3"
            component={"h3"}
            lineHeight={1.6}
            sx={{
              maxWidth: "600px",
            }}
          >
            <Trans id="error.page.404.description">
              You may have entered an incorrect address (URL), or the page or
              document no longer exists or its name may have been changed. The
              page you requested could not be found.
            </Trans>
          </Typography>
          <Link
            color="primary"
            sx={{
              width: "fit-content",
            }}
            href="/"
          >
            <Trans id="error.page.404.back-link">
              Click here to return to homepage
            </Trans>
          </Link>
        </Box>
      </ContentWrapper>
    </ApplicationLayout>
  );
};

export default ErrorPage;
