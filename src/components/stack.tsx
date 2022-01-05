import { Box } from "theme-ui";

const Stack = ({
  direction = "column",
  spacing = 1,
  children,
}: {
  direction?: "column" | "row";
  spacing?: number;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        "& > * + *": {
          [direction === "column" ? "mt" : "ml"]: spacing,
        },
      }}
    >
      {children}
    </Box>
  );
};

export default Stack;
