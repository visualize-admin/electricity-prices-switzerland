import * as React from "react";
import { Flex, Text, Box } from "@theme-ui/components";
import { useTranslation } from "next-i18next";
import { Icon, IconName } from "../icons";
import { keyframes } from "@emotion/core";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <Flex
    sx={{
      justifyContent: "center",
      alignItems: "center",
      color: "error",
      borderColor: "error",
    }}
  >
    {children}
  </Flex>
);

export const Hint = ({ children }: { children: React.ReactNode }) => (
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
    }}
  >
    {children}
  </Flex>
);

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => {
  const { t } = useTranslation();
  return (
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
      <Text variant="heading4">{t("hint.loading.data", "Loading data…")}</Text>
    </Flex>
  );
};

export const LoadingIcon = ({ delayMs = 200 }: { delayMs?: number }) => (
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
      <Icon name="loading" size={32} />
    </Box>
  </Flex>
);

export const LoadingIconInline = ({
  size = 20,
  delayMs = 200,
}: {
  size?: number;
  delayMs?: number;
}) => (
  <Box
    sx={{
      display: "inline-block",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
  >
    <Box
      sx={{
        animation: `1s linear infinite ${spin}`,
      }}
    >
      <Icon name="loading" size={size} />
    </Box>
  </Box>
);

export const LoadingOverlay = () => (
  <Box
    sx={{
      position: "absolute",
      bg: "monochrome100",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    }}
  >
    <Loading delayMs={0} />
  </Box>
);

export const NoDataHint = () => {
  const { t } = useTranslation();
  return (
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
      }}
    >
      <Icon name="warning" size={64} />
      <Text variant="heading2" sx={{ my: 3 }}>
        {t("hint.nodata.title", "Keine Daten")}
      </Text>
      <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
        {t(
          "hint.nodata.message",
          "Für die aktuelle Auswahl konnten keine Daten geladen werden."
        )}
      </Text>
    </Flex>
  );
};

export const NoContentHint = () => {
  const { t } = useTranslation();

  return (
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
      }}
    >
      <Icon name="warning" size={48} />

      <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
        {t(
          "hint.nocontent.message",
          "Dieser Inhalt konnte nicht geladen werden"
        )}
      </Text>
    </Flex>
  );
};

export const NoGeoDataHint = () => {
  const { t } = useTranslation();

  return (
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
      }}
    >
      <Icon name="warning" size={64} />
      <Text variant="heading2" sx={{ my: 3 }}>
        {t("hint.nogeodata.title", "Keine Kartendarstellung möglich")}
      </Text>
      <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
        {t(
          "hint.nogeodata.message",
          "Für das ausgewählte Jahr kann keine Karte angezeigt werden."
        )}
      </Text>
    </Flex>
  );
};

export const HintBlue = ({
  iconName,
  children,
}: {
  iconName: IconName;
  children: React.ReactNode;
}) => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      p: 5,
      bg: "primaryLight",
      color: "primary",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"],
    }}
  >
    <Box sx={{ width: 24, pr: 4 }}>
      <Icon name={iconName} size={24} />
    </Box>
    <Text variant="paragraph1" sx={{ textAlign: "left", ml: 4 }}>
      {children}
    </Text>
  </Flex>
);
export const HintRed = ({
  iconName,
  children,
}: {
  iconName: IconName;
  children: React.ReactNode;
}) => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      borderRadius: "bigger",
      margin: "auto",
      p: 5,
      bg: "alertLight",
      color: "alert",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"],
    }}
  >
    <Box sx={{ width: 24, pr: 4 }}>
      <Icon name={iconName} size={24} />
    </Box>
    <Text variant="paragraph1" sx={{ textAlign: "left", ml: 4 }}>
      {children}
    </Text>
  </Flex>
);
