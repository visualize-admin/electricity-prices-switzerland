import { Box, Text } from "@theme-ui/components";
import * as React from "react";
import { ReactNode } from "react";
import { Download } from "./download-image";

export const Card = ({
  title,
  id,
  children,
}: {
  title: string | ReactNode;
  id?: Download;
  children: ReactNode;
}) => {
  return (
    <Box
      // This id is used by the screenshot function
      id={id}
      sx={{
        bg: "monochrome100",
        p: 5,
        m: 4,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome300",
        boxShadow: "primary",
      }}
    >
      <Text
        as="h2"
        variant="heading2"
        sx={{ pt: 1, color: "monochrome800", mb: 4 }}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
};
