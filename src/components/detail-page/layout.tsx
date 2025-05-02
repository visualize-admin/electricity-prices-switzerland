import { Box, Typography } from "@mui/material";
import { Children, isValidElement, ReactNode } from "react";

import { SectionProps } from "./card";

type DetailsPageBaseProps = {
  children: ReactNode;
};

type Props = {
  selector: ReactNode;
  download?: string | string[];
} & DetailsPageBaseProps;

export const DetailPageLayout = ({ children, selector, download }: Props) => {
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
        gridTemplateColumns: [`1fr`, `20rem 1fr`],
        gridTemplateRows: [`auto`, `auto 1fr`],
        gridTemplateAreas: [
          `
  "selector"
  "main"
  `,
          `
  "selector main"
  "selector main"
  `,
        ],
      }}
    >
      <Box
        sx={{
          gridArea: "main",
          pl: [0, 16],
          bgcolor: "secondary.50",
          borderLeftWidth: "1px",
          borderLeftStyle: "solid",
          borderLeftColor: "monochrome.300",
        }}
      >
        <Box
          sx={{
            py: 10,
            flexDirection: "column",
            gap: 10,
          }}
          display={"flex"}
        >
          {renderedChildren}
        </Box>
      </Box>
      <Box
        sx={{
          gridArea: "selector",
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "fit-content",
        }}
      >
        {!download && selector}
      </Box>
    </Box>
  );
};

export const DetailsPageHeader = ({ children }: DetailsPageBaseProps) => {
  return (
    <Box
      sx={{
        flexDirection: "column",
        gap: 4,
      }}
      display={"flex"}
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
