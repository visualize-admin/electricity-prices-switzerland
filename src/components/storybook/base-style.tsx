import {
  Box,
  BoxProps,
  Paper,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ReactNode } from "react";

import { Icon } from "src/icons";

type DesignStoryBaseProps = {
  children: ReactNode;
} & BoxProps;

type DesignStoryProps = {
  title?: string;
  reference?: string;
} & DesignStoryBaseProps;

export const DesignStory = (props: DesignStoryProps) => {
  const { title, reference, children, ...restProps } = props;
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      padding={8}
      width={"100%"}
      height={"100%"}
      sx={{
        gap: 10,
      }}
      {...restProps}
    >
      <Box
        display={"flex"}
        sx={{
          flexDirection: "column",
        }}
      >
        {reference && (
          <Typography variant="body2" color={"#999"}>
            {reference}
          </Typography>
        )}
        <Typography
          variant="h2"
          fontSize={"40px !important"}
          fontWeight={500}
          color={"#333"}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};

export const DesignGrid = (props: DesignStoryBaseProps) => {
  const { children, ...restProps } = props;

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(2, 1fr)"
      gap={10}
      {...restProps}
    >
      {children}
    </Box>
  );
};

export const DesignSection = (
  props: Omit<DesignStoryProps, "reference"> & { note?: string }
) => {
  const { title, children, note, ...restProps } = props;

  return (
    <Box
      display={"flex"}
      sx={{
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Box>
        <Typography variant="h3" fontWeight={700} color={"black"}>
          {title}
        </Typography>
        {note && (
          <Box
            display={"flex"}
            sx={{
              alignItems: "center",
              gap: 1,
            }}
          >
            <Icon name="warningcircle" size={16} />
            <Typography variant="caption" color={"#666"}>
              {note}
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        sx={{
          gap: 11,
        }}
        {...restProps}
      >
        {children}
      </Box>
    </Box>
  );
};

const VARIANT_TITLES: Record<string, string> = {
  display1: "Display1 - 64 | 110%",
  display2: "Display2 - 48 | 110%",
  h1: "h1 - 32 | 130%",
  h2: "h2 - 24 | 140%",
  h3: "h3 - 20 | 160%",
  body1: "Body1 - 18 | 150%",
  body2: "Body2 - 16 | 150%",
  body3: "Body3 - 14 | 110%",
  caption: "Caption - 12 | 150%",
  captionSuperscript: "Caption superscript - 12 | 150%",
};

export const TypographyStack = (props: TypographyProps) => {
  const { variant = "body1", sx, ...restProps } = props;
  const title = VARIANT_TITLES[sx ? "captionSuperscript" : variant] ?? variant;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Typography color="secondary.400">{title}</Typography>
      <Typography variant={variant} sx={sx} {...restProps} />
    </Box>
  );
};

type ColorPaletteProps = {
  title: string;
  accessibilityNotes?: Record<string, string>[];
} & DesignStoryBaseProps;

export const ColorPaletteStack = (props: ColorPaletteProps) => {
  const { title, accessibilityNotes, children, ...restProps } = props;

  return (
    <Box
      display={"flex"}
      sx={{
        flexDirection: "column",
        gap: 8,
      }}
    >
      <Box
        display={"flex"}
        sx={{
          flexDirection: "column",
        }}
      >
        <Typography variant="body2" fontWeight={"bold"} color={"black"}>
          {title}
        </Typography>
        {accessibilityNotes?.map((note, i) => {
          const [key, value] = Object.entries(note)[0];
          return (
            <Typography
              key={`${title}-${i}`}
              variant="body2"
              color="#666"
              component="div"
              sx={{ display: "inline", mr: 1 }}
            >
              <strong>{key}:</strong> {value}
            </Typography>
          );
        })}
      </Box>
      <Box
        sx={{
          gap: 4.5,
        }}
        display={"flex"}
        {...restProps}
      >
        {children}
      </Box>
    </Box>
  );
};

type ColorSwatchProps = {
  color?: string;
  primary?: boolean;
  swatch: {
    [key: string]: string;
  };
};
export const ColorSwatch = ({ swatch, color, primary }: ColorSwatchProps) => {
  const [[key, value]] = Object.entries(swatch);

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box
        sx={{
          width: "80px",
          height: "80px",
          backgroundColor: value,
          borderRadius: primary ? "9999px" : 1,
        }}
      />
      <Typography
        fontSize="8px !important"
        fontWeight={450}
        lineHeight="150%"
        color="#666"
      >
        {color} {key}
      </Typography>
      <Typography
        fontSize="14px !important"
        lineHeight="120%"
        letterSpacing="-0.5px"
        color="#666"
      >
        {value}
      </Typography>
    </Box>
  );
};

type ElevationStackProps = {
  elevation: number;
};

export const ElevationStack = (props: ElevationStackProps) => {
  const { elevation } = props;
  return (
    <Box
      display={"flex"}
      sx={{
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h3" fontWeight={500} color={"black"}>
        Elevation {elevation}
      </Typography>
      <Paper
        elevation={elevation}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: "#EBEBEB",
          textAlign: "center",
          height: "160px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon name="menu" size={48} color="#fff" />
      </Paper>
    </Box>
  );
};
