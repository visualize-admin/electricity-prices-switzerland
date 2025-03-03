import { Box, BoxProps } from "@mui/material";

export const Stack = ({
  direction = "column",
  spacing = 1,
  children,
  sx,
}: {
  direction?: "column" | "row";
  spacing?: number;
  children: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        "& > * + *:not(_)": {
          // The not(_) is to increase specificity slightly
          [direction === "column" ? "mt" : "ml"]: spacing,
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
