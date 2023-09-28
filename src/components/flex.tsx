import { Box, BoxProps } from "@mui/material";

const Flex = (props: Omit<BoxProps, "display">) => {
  return <Box {...props} display="flex" />;
};

export default Flex;
