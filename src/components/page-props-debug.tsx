import { Button, Drawer, Box, Typography, IconButton } from "@mui/material";
import React, { useState } from "react";
import { ObjectInspector } from "react-inspector";

import { IconClose } from "src/icons/ic-close";

type PagePropsDebugProps = {};

const PagePropsDebug: React.FC<PagePropsDebugProps> = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pageProps =
    // biome-ignore lint/complexity/useOptionalChain: window is checked for undefined
    typeof window !== "undefined" && window.__NEXT_DATA__?.props?.pageProps;

  if (!pageProps) {
    return null;
  }

  return (
    <>
      {/* Debug Button */}
      <Button
        variant="contained"
        onClick={() => setIsDrawerOpen(true)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        Debug Props
      </Button>

      {/* Drawer */}
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: "70vh",
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          },
        }}
      >
        <Box p={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Page Props</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}>
              <IconClose />
            </IconButton>
          </Box>
          <Box
            p={2}
            borderRadius={1}
            overflow="auto"
            maxHeight="50vh"
            sx={{
              backgroundColor: "grey.100",
            }}
          >
            <ObjectInspector data={pageProps} expandLevel={2} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default PagePropsDebug;
