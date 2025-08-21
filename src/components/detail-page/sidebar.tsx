import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { SafeHydration } from "src/components/hydration";
import { Icon } from "src/icons";
import { useFlag } from "src/utils/flags";

import { SectionProps } from "./card";

export const DetailsPageSidebar = (props: SectionProps) => {
  const { id, entity } = props;

  const sunshineFlag = useFlag("sunshine");

  return (
    <Box
      sx={{
        flexDirection: "column",
      }}
      display={"flex"}
    >
      <SidebarSectionTitle>
        <Trans id="details.page.navigation.electricity-insights-title">
          Insights into electricity
        </Trans>
      </SidebarSectionTitle>
      <SidebarItem href={`/${entity}/${id}`}>
        <Trans id="details.page.navigation.electricity-tariffs-item">
          Electricity tariffs
        </Trans>
      </SidebarItem>
      {/* FIXME: Make this only a preview and add a coming soon label */}
      {sunshineFlag && entity === "operator" ? (
        <SafeHydration>
          <>
            <SidebarSectionTitle>
              <Trans id="details.page.navigation.sunshine-indicators-title">
                Sunshine Indicators
              </Trans>
            </SidebarSectionTitle>
            <SidebarItem
              href={`/sunshine/${entity}/${id}/overview#main-content`}
            >
              <Trans id="details.page.navigation.sunshine-overview-item">
                Overview
              </Trans>
            </SidebarItem>
            <SidebarItem
              href={`/sunshine/${entity}/${id}/costs-and-tariffs#main-content`}
            >
              <Trans id="details.page.navigation.costs-and-tariffs-item">
                Costs and Tariffs
              </Trans>
            </SidebarItem>
            <SidebarItem
              href={`/sunshine/${entity}/${id}/power-stability#main-content`}
            >
              <Trans id="details.page.navigation.power-stability-item">
                Power Stability
              </Trans>
            </SidebarItem>
            <SidebarItem
              href={`/sunshine/${entity}/${id}/operational-standards#main-content`}
            >
              <Trans id="details.page.navigation.operational-standards-item">
                Operational Standards
              </Trans>
            </SidebarItem>
          </>
        </SafeHydration>
      ) : null}
    </Box>
  );
};

type SidebarBaseProps = {
  children: ReactNode;
};

const SidebarSectionTitle = (props: SidebarBaseProps) => {
  const { children } = props;

  return (
    <Box
      sx={{
        pl: 12,
        pr: 8,
        pb: 3,
        pt: 11.5,
        borderBottom: 1,
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome.200",
      }}
    >
      <Typography
        variant="caption"
        color={"text.500"}
        sx={{
          lineHeight: "150%",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};

type SidebarItemProps = {
  href: string;
  matchMethod?: "exact" | "contains";
} & SidebarBaseProps;

const SidebarItem = (props: SidebarItemProps) => {
  const { children, href, matchMethod } = props;
  const { asPath } = useRouter();

  const isActive = () => {
    const path = asPath.split("?")[0];
    switch (matchMethod) {
      case "exact":
        return path === href;
      case "contains":
        return path.includes(href);
      default:
        return path === href;
    }
  };

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Box
        sx={{
          pl: 12,
          pr: 8,
          py: 5,
          justifyContent: "space-between",
          borderLeft: isActive() ? 3 : 0,
          borderLeftStyle: "solid",
          borderLeftColor: "primary.main",
          alignItems: "center",
          borderBottom: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome.200",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
        display={"flex"}
      >
        <Typography variant="body2" color={"text.primary"}>
          {children}
        </Typography>
        <Icon name="chevronright" />
      </Box>
    </Link>
  );
};
