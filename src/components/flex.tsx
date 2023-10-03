import { Box, BoxProps } from "@mui/material";
import { forwardRef } from "react";

const Flex = forwardRef((props: Omit<BoxProps, "display">, ref) => {
  return <Box {...props} display="flex" ref={ref} />;
});

export default Flex;
