import { Trans } from "@lingui/macro";
import { Box, Link as MUILink, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { Icon } from "src/icons";

type DetailsPageSidebarProps = {
  id: string;
  entity: string;
};

export const DetailsPageSidebar = (props: DetailsPageSidebarProps) => {
  const { id, entity } = props;
  return (
    <Box
      sx={{
        flexDirection: "column",
      }}
      display={"flex"}
    >
      <SidebarSectionTitle>
        <Trans id="details.page.navigation.electricity-insights-title">
          Electricity Insights
        </Trans>
      </SidebarSectionTitle>
      <SidebarItem href={`/${entity}/${id}`}>
        <Trans id="details.page.navigation.electricity-tariffs-item">
          Electricity Tariffs
        </Trans>
      </SidebarItem>

      {/* FIXME: Make this only a preview and add a coming soon label */}
      <SidebarSectionTitle>
        <Trans id="details.page.navigation.sunshine-indicators-title">
          Sunshine Indicators
        </Trans>
      </SidebarSectionTitle>
      <SidebarItem href={`/${entity}/${id}/overview`}>
        <Trans id="details.page.navigation.sunshine-overview-item">
          Overview
        </Trans>
      </SidebarItem>
      <SidebarItem href={`/${entity}/${id}/costs-and-tariffs`}>
        <Trans id="details.page.navigation.costs-and-tariffs-item">
          Costs and Tariffs
        </Trans>
      </SidebarItem>
      <SidebarItem href={`/${entity}/${id}/power-stability`}>
        <Trans id="details.page.navigation.power-stability-item">
          Power Stability
        </Trans>
      </SidebarItem>
      <SidebarItem href={`/${entity}/${id}/operational-standards`}>
        <Trans id="details.page.navigation.operational-standards-item">
          Operational Standards
        </Trans>
      </SidebarItem>
    </Box>
  );
};

type SidebarBaseProps = {
  children: ReactNode;
};

export const SidebarSectionTitle = (props: SidebarBaseProps) => {
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

export const SidebarItem = (props: SidebarItemProps) => {
  const { children, href, matchMethod } = props;
  const { asPath } = useRouter();

  const isActive = () => {
    switch (matchMethod) {
      case "exact":
        return asPath === href;
      case "contains":
        return asPath.includes(href);
      default:
        return asPath === href;
    }
  };

  return (
    <MUILink
      href={href}
      variant="h6"
      color={"text.primary"}
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
      }}
      display={"flex"}
    >
      {children}
      <Icon name="chevronright" />
    </MUILink>
  );
};
