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
            <Trans id="error.page.500.title">Temporarily Unavailable</Trans>
          </Typography>

          <Typography
            variant="h3"
            component={"h3"}
            lineHeight={1.6}
            sx={{
              maxWidth: "600px",
            }}
          >
            <Trans id="error.page.500.description">
              The desired page or function is unfortunately not available at the
              moment. Please try again later.
            </Trans>
          </Typography>
          <Link
            color="primary"
            sx={{
              width: "fit-content",
            }}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
          >
            <Trans id="error.page.500.reload-link">Reload page</Trans>
          </Link>
        </Box>
      </ContentWrapper>
    </ApplicationLayout>
  );
};

export default ErrorPage;
