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
        gridTemplateColumns: [`1fr`, `1fr 20rem`],
        gridTemplateRows: [`auto`, `auto 1fr`],
        gridTemplateAreas: [
          `
  "selector"
  "main"
  "aside"
  `,
          `
  "main selector"
  "main aside"
  `,
        ],
      }}
    >
      <Box
        sx={{
          gridArea: "main",
          px: [0, 3],
          borderRightWidth: "1px",
          borderRightStyle: "solid",
          borderRightColor: "grey.500",
        }}
      >
        {main}
      </Box>
      <Box
        sx={{
          gridArea: "selector",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "grey.500",
        }}
      >
        {selector}
      </Box>
      <Box sx={{ gridArea: "aside", bgcolor: "grey.100" }}>{aside}</Box>
    </Box>
  );
};
