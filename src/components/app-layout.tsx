import {
  ConsentBanner,
  forgetMatomoConsent,
  giveMatomoConsent,
  useConsentBanner,
} from "@interactivethings/swiss-federal-ci/dist/components";
import {
  MenuButton,
  MenuContainer,
} from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { Trans, t } from "@lingui/macro";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { SafeHydration } from "src/components/hydration";
import { Search } from "src/components/search";
import { useMatomo } from "src/domain/analytics";

type ApplicationLayoutProps = {
  children: ReactNode;
  errorState?: boolean;
  showHeaderCaption?: boolean;
};

export const ApplicationLayout = ({
  children,
  errorState,
  showHeaderCaption = true,
}: ApplicationLayoutProps) => {
  const [highlightContext, setHighlightContext] = useState<HighlightValue>();
  const matomoId = useMatomo();
  const { hasConsented, isShown, giveConsent, rejectConsent } =
    useConsentBanner();

  useEffect(() => {
    if (hasConsented === "accepted") {
      giveMatomoConsent();
    } else if (hasConsented === "rejected") {
      forgetMatomoConsent();
    }
  }, [hasConsented]);

  return (
    <HighlightContext.Provider
      value={{
        value: highlightContext,
        setValue: setHighlightContext,
      }}
    >
      <Box display="flex" flexDirection="column">
        <Header showCaption={showHeaderCaption} />
        <Box display="flex" flexDirection="column">
          {!errorState && (
            <SafeHydration>
              <AppNavigation />
            </SafeHydration>
          )}
          {children}
        </Box>
        <Footer />
      </Box>
      {matomoId && (
        <ConsentBanner
          isShown={isShown}
          content={
            <Trans id="cookie.banner.content">
              To optimally tailor our website to your needs, we use the
              analytics tool Matomo. Your behaviour on the website is recorded
              in anonymised form. No personal data is transmitted or stored. If
              you do not agree, you can prevent data collection by Matomo and
              still use this website without restrictions.
            </Trans>
          }
          acceptButtonLabel={<Trans id="cookie.banner.accept">Accept</Trans>}
          rejectButtonLabel={<Trans id="cookie.banner.reject">Reject</Trans>}
          onConsentGive={giveConsent}
          onConsentReject={rejectConsent}
        />
      )}
    </HighlightContext.Provider>
  );
};

const AppNavigation = () => {
  const { asPath: asPathWithQueryString } = useRouter();
  const asPath = asPathWithQueryString.split("?")[0];

  return (
    <Box position="relative">
      {/* FIXME: creates ugly x-scroll  due to nested ContentWrapper */}
      <MenuContainer
        sx={{
          px: 3,
        }}
      >
        <MenuButton
          title={t({ id: "home.menu.overview", message: "Overview" })}
          active={asPath === "/"}
          href={"/"}
          //FIXME: alter MenuButton for searchbar spacing, goal is to have the bottom red border, aligned with bottom of MenuContainer
          sx={{
            ".MuiButtonBase-root": {
              py: {
                md: 6,
              },
            },
          }}
        />
        <MenuButton
          title={t({ id: "home.menu.map-view", message: "Map view" })}
          active={
            asPath === "/map" ||
            asPath.includes("municipality") ||
            asPath.includes("canton")
          }
          href={"/map"}
          //FIXME: alter MenuButton for searchbar spacing
          sx={{
            ".MuiButtonBase-root": {
              py: {
                md: 6,
              },
            },
          }}
        />
        <Box flex={1} />
        <Search />
      </MenuContainer>
    </Box>
  );
};
