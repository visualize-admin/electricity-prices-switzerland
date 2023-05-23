import { Box, BoxProps } from "theme-ui";

export const SectionContentContainer = ({
  children,
  sx,
}: React.PropsWithChildren<{
  sx?: BoxProps["sx"];
}>) => {
  return (
    <Box sx={sx}>
      <Box
        sx={{
          maxWidth: 1600,
          margin: "auto",
          display: "flex",
          justifyContent: "stretch",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
