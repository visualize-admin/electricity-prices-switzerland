import * as React from "react";
import { Flex, Text, Box } from "@theme-ui/components";
import { Trans } from "@lingui/macro";
import { Icon, IconName } from "../icons";
import { keyframes } from "@emotion/core";

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => (
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
      padding: 2,
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
  >
    <Box
      sx={{
        animation: `1s linear infinite ${spin}`,
      }}
    >
      <Icon name="loading" size={48} />
    </Box>
    <Text variant="heading4">
      <Trans id="hint.loading.data">Lade Daten…</Trans>
    </Text>
  </Flex>
);
