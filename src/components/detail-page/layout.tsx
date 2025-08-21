import { Box, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Children, isValidElement, ReactNode } from "react";

import { useIsMobile } from "src/lib/use-mobile";

import { SectionProps } from "./card";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

const ApplicationLayout = dynamic(
  () =>
    import("src/components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

type DetailsPageBaseProps = {
  children: ReactNode;
};

type Props = {
  selector: ReactNode;
  download?: string | string[];
} & DetailsPageBaseProps;

const DetailPageContentLayout = ({ children, selector, download }: Props) => {
  const renderedChildren = download
    ? Children.map(children, (child) => {
        if (
          isValidElement<SectionProps>(child) &&
          "id" in child.props &&
          child.props.id === download
        ) {
          return child;
        }
        return null;
      })
    : children;

  return (
    <Box
      display="grid"
      sx={{
        gap: 0,
        gridTemplateColumns: { xxs: `1fr`, md: `20rem 1fr` },
        gridTemplateRows: { xxs: `auto`, md: `auto 1fr` },
        gridTemplateAreas: {
          xxs: `
  "selector"
  "main"
  `,
          md: `
"selector main"
  "selector main"
  `,
        },
      }}
    >
      <Box
        sx={{
          gridArea: "main",
          pl: { xxs: 0, md: 16 },
          bgcolor: "secondary.50",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            py: 10,
            flexDirection: "column",
            gap: 10,
          }}
          data-testid="details-page-content"
          display={"flex"}
        >
          {renderedChildren}
        </Box>
      </Box>
      <Box
        sx={{
          gridArea: "selector",
          alignSelf: "start",
          borderRight: "1px solid",
          borderRightColor: "divider",
          position: "relative",
          height: "100%",
        }}
      >
        <Box sx={{ position: "sticky", top: 0 }}>{!download && selector}</Box>
      </Box>
    </Box>
  );
};

export const DetailsPageHeader = ({
  children,
  ...props
}: DetailsPageBaseProps & { id?: string }) => {
  return (
    <Box
      sx={{
        flexDirection: "column",
        gap: 4,
        scrollMarginTop: "100px",
      }}
      display={"flex"}
      {...props}
    >
      {children}
    </Box>
  );
};

export const DetailsPageTitle = ({ children }: DetailsPageBaseProps) => {
  return (
    <Typography variant="h1" component={"h2"}>
      {children}
    </Typography>
  );
};

export const DetailsPageSubtitle = ({ children }: DetailsPageBaseProps) => {
  return (
    <Typography variant="body2" component={"h2"}>
      {children}
    </Typography>
  );
};

// Generic DetailsPage component
interface DetailsPageProps {
  title: string;
  BannerContent: React.ReactNode;
  SidebarContent?: React.ReactNode;
  MainContent: React.ReactNode;
  download?: string | string[];
}

export const DetailsPageLayout = ({
  title,
  BannerContent,
  SidebarContent,
  MainContent,
  download,
}: DetailsPageProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <ApplicationLayout>
        <Box
          sx={{
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "monochrome.300",
          }}
        >
          <ContentWrapper
            sx={{
              flexGrow: 1,
              backgroundColor: "background.paper",
            }}
          >
            {BannerContent}
          </ContentWrapper>
        </Box>
        <Box
          sx={{
            backgroundColor: "secondary.50",
          }}
        >
          <ContentWrapper
            sx={{
              backgroundColor: "secondary.50",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: "background.paper",
              }}
            >
              <DetailPageContentLayout
                download={download}
                selector={!isMobile && SidebarContent ? SidebarContent : null}
              >
                {MainContent}
              </DetailPageContentLayout>
            </Box>
          </ContentWrapper>
        </Box>
      </ApplicationLayout>
    </>
  );
};
