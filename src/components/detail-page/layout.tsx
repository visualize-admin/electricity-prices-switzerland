import { Grid, Box } from "theme-ui";

type Props = {
  main: React.ReactNode;
  selector: React.ReactNode;
  aside: React.ReactNode;
};

export const DetailPageLayout = ({ main, selector, aside }: Props) => {
  return (
    <Grid
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
          borderRightColor: "monochrome500",
        }}
      >
        {main}
      </Box>
      <Box
        sx={{
          gridArea: "selector",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome500",
        }}
      >
        {selector}
      </Box>
      <Box sx={{ gridArea: "aside", bg: "monochrome100" }}>{aside}</Box>
    </Grid>
  );
};
