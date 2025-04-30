import { Box } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  main: ReactNode;
  selector: ReactNode;
  aside: ReactNode;
};

export const DetailPageLayout = ({ main, selector, aside }: Props) => {
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
  "aside"
  `,
          `
  "selector main"
  "aside main"
  `,
        ],
      }}
    >
      <Box
        sx={{
          gridArea: "main",
          px: [0, 3],
          bgcolor: "secondary.50",
          borderLeftWidth: "1px",
          borderLeftStyle: "solid",
          borderLeftColor: "monochrome.300",
        }}
      >
        {main}
      </Box>
      <Box
        sx={{
          gridArea: "selector",
        }}
      >
        {selector}
      </Box>
    </Box>
  );
};
