import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { StoryGrid } from "src/components/storybook/story-grid";
import { Icon } from "src/icons";
import { chartPalette, palette } from "src/themes/palette";

import {
  ColorPaletteStack,
  ColorSwatch,
  DesignGrid,
  DesignSection,
  DesignStory,
  TypographyStack,
} from "./storybook/base-style";

const StoryContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box p={6} sx={{ "& > * + *": { mt: 2 } }}>
      {children}
    </Box>
  );
};

export const TypographyStory = () => {
  const defaultText = "The quick brown fox...";
  return (
    <DesignStory
      title="Typography System"
      reference="BUND Library (Swiss Federeal CI)"
    >
      <DesignGrid>
        <DesignSection title="Regular">
          {" "}
          <TypographyStack title="Display1 - 64 | 110%" variant="display1">
            {defaultText}
          </TypographyStack>
          <TypographyStack variant="display2">{defaultText}</TypographyStack>
          <TypographyStack variant="h1">{defaultText}</TypographyStack>
          <TypographyStack variant="h2">{defaultText}</TypographyStack>
          <TypographyStack variant="h3">{defaultText}</TypographyStack>
          <TypographyStack variant="body1">{defaultText}</TypographyStack>
          <TypographyStack variant="body2">{defaultText}</TypographyStack>
          <TypographyStack variant="body3">{defaultText}</TypographyStack>
          <TypographyStack variant="caption">{defaultText}</TypographyStack>
          {/* FIXME: Currently there is no caption superscript type in swiss-federal-ci */}
          <TypographyStack
            variant="caption"
            sx={{
              fontFeatureSettings: `'liga' off, 'clig' off, 'sups' on`,
            }}
          >
            {defaultText}
          </TypographyStack>
        </DesignSection>
        <DesignSection title="Bold">
          <TypographyStack fontWeight={"bold"} variant="display1">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="display2">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="h1">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="h2">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="h3">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="body1">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="body2">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="body3">
            {defaultText}
          </TypographyStack>
          <TypographyStack fontWeight={"bold"} variant="caption">
            {defaultText}
          </TypographyStack>
          {/* FIXME: Currently there is no caption superscript type in swiss-federal-ci */}
          <TypographyStack
            fontWeight={"bold"}
            variant="caption"
            sx={{
              fontFeatureSettings: `'liga' off, 'clig' off, 'sups' on`,
            }}
          >
            {defaultText}
          </TypographyStack>
        </DesignSection>
      </DesignGrid>
    </DesignStory>
  );
};

const normalizeSwatchGroup = (entries: [string, string][]) => {
  const seen = new Map<string, string>();
  const output: [string, string][] = [];

  for (const [key, value] of entries) {
    const normalizedKey = key === "main" || key === "primary" ? "P" : key;

    if (seen.has(value)) {
      const existingKey = seen.get(value)!;

      const updated = output.map(([k, v]) =>
        v === value && k === existingKey ? [`${k} P`, v] : [k, v]
      ) as [string, string][];
      output.splice(0, output.length, ...updated);
    } else {
      seen.set(value, normalizedKey);
      output.push([normalizedKey, value]);
    }
  }

  return output;
};

const isPrimary = (key: string) => key.endsWith("P");

export const PaletteStory = () => {
  const primary = normalizeSwatchGroup(Object.entries(palette.primary));
  const secondary = normalizeSwatchGroup(Object.entries(palette.secondary));
  const text = normalizeSwatchGroup(Object.entries(palette.text));

  const categorical = chartPalette.categorical;

  return (
    <DesignStory title="Brand Color Styles" reference="BUND Library">
      <DesignSection
        title="Core"
        sx={{
          mt: -8,
          gap: 20,
        }}
      >
        <ColorPaletteStack
          title="Primary Color"
          accessibilityNotes={[
            {
              "Red 600 P":
                "White text on Red 600 is AA accessible. Main color for logos and actions",
            },
          ]}
        >
          {primary.map(([key, value]) => (
            <ColorSwatch
              key={`${key}-${value}`}
              swatch={{ [key]: value }}
              primary={isPrimary(key)}
              color="Red"
            />
          ))}
        </ColorPaletteStack>

        <ColorPaletteStack
          title="Secondary Color"
          accessibilityNotes={[
            {
              "Cobalt 400 P": "White text on Cobald 400 is AA accessible.",
            },
          ]}
        >
          {secondary.map(([key, value]) => (
            <ColorSwatch
              key={`${key}-${value}`}
              swatch={{ [key]: value }}
              primary={isPrimary(key)}
              color="Cobalt"
            />
          ))}
        </ColorPaletteStack>

        <ColorPaletteStack
          title="Primary Color"
          accessibilityNotes={[
            {
              "Monochrome 300 P":
                "Borders and lines color on light backgrounds",
            },
            {
              "Monochrome 500": "Text color for less importance paragraphs",
            },
            {
              "Monochrome 800 P": "Standard text color",
            },
          ]}
        >
          {text.map(([key, value]) => (
            <ColorSwatch
              key={`${key}-${value}`}
              swatch={{ [key]: value }}
              primary={isPrimary(key)}
              color="Monochrome"
            />
          ))}
        </ColorPaletteStack>
        <ColorPaletteStack title="Default Color">
          <ColorSwatch swatch={{ White: palette.background.paper }} />
          {/* FIXME: #000 doesn't exist in swiss-federal-ci */}
          <ColorSwatch swatch={{ Black: "#000" }} />
        </ColorPaletteStack>
      </DesignSection>
      <DesignSection
        title="Elcom"
        sx={{
          mt: -8,
          gap: 20,
        }}
      >
        <ColorPaletteStack title="Categorical Colors">
          {categorical.map((value) => (
            <ColorSwatch
              key={`categorical-${value}`}
              swatch={{ [""]: value }}
              color="Categorical"
            />
          ))}
        </ColorPaletteStack>
        <ColorPaletteStack
          title="Sequential Colors"
          sx={{
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Box gap={4.5} display={"flex"}>
            {chartPalette.sequential.orange.map((value) => (
              <ColorSwatch
                key={`sequential-orange-${value}`}
                swatch={{ [""]: value }}
                color="Orange"
              />
            ))}
          </Box>
          <Box gap={4.5} display={"flex"}>
            {chartPalette.sequential.yellow.map((value) => (
              <ColorSwatch
                key={`sequential-yellow-${value}`}
                swatch={{ [""]: value }}
                color="Yellow"
              />
            ))}
          </Box>
          <Box gap={4.5} display={"flex"}>
            {chartPalette.sequential.green.map((value) => (
              <ColorSwatch
                key={`sequential-green-${value}`}
                swatch={{ [""]: value }}
                color="Green"
              />
            ))}
          </Box>
          <Box gap={4.5} display={"flex"}>
            {chartPalette.sequential.teal.map((value) => (
              <ColorSwatch
                key={`sequential-teal-${value}`}
                swatch={{ [""]: value }}
                color="Teal"
              />
            ))}
          </Box>
          <Box gap={4.5} display={"flex"}>
            {chartPalette.sequential.blue.map((value) => (
              <ColorSwatch
                key={`sequential-blue-${value}`}
                swatch={{ [""]: value }}
                color="Blue"
              />
            ))}
          </Box>
          <Box gap={4.5} display={"flex"}>
            {chartPalette.sequential.indigo.map((value) => (
              <ColorSwatch
                key={`sequential-indigo-${value}`}
                swatch={{ [""]: value }}
                color="Indigo"
              />
            ))}
          </Box>
        </ColorPaletteStack>
        <ColorPaletteStack
          title="Diverging Colors"
          sx={{
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Box gap={4.5} display={"flex"}>
            {chartPalette.diverging.GreenToOrange.map((value) => (
              <ColorSwatch
                key={`sequential-grToOr-${value}`}
                swatch={{ [""]: value }}
                color="Green to Orange"
              />
            ))}
          </Box>
          <Box gap={4.5} display={"flex"}>
            {chartPalette.diverging.BlueToPink.map((value) => (
              <ColorSwatch
                key={`sequential-blToPk-${value}`}
                swatch={{ [""]: value }}
                color="Blue to Pink"
              />
            ))}
          </Box>
        </ColorPaletteStack>
      </DesignSection>
    </DesignStory>
  );
};

export const ButtonStory = () => (
  <StoryContainer>
    <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </Stack>
    <Typography variant="subtitle1" gutterBottom>
      Colors
    </Typography>
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <Button color="primary" variant="contained">
        Primary
      </Button>
      <Button color="secondary" variant="contained">
        Secondary
      </Button>
      <Button color="success" variant="contained">
        Success
      </Button>
      <Button color="error" variant="contained">
        Error
      </Button>
      <Button color="info" variant="contained">
        Info
      </Button>
      <Button color="warning" variant="contained">
        Warning
      </Button>
    </Stack>
    <Typography variant="subtitle1" gutterBottom>
      Sizes
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Large</Button>
    </Stack>
  </StoryContainer>
);

export const FormStory = () => (
  <StoryContainer>
    <Box>
      <Typography variant="h5" gutterBottom>
        Input Fields
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={3}>
        <TextField label="Standard" variant="standard" />
        <TextField label="Outlined" variant="outlined" />
        <TextField label="Filled" variant="filled" />
        <TextField
          label="With Helper Text"
          helperText="Some helper text"
          variant="outlined"
        />
        <TextField
          error
          label="Error"
          defaultValue="Invalid value"
          helperText="Error message"
          variant="outlined"
        />
        <TextField
          label="Disabled"
          disabled
          defaultValue="Disabled input"
          variant="outlined"
        />
      </Stack>
    </Box>
    <Box>
      <Typography variant="h5" gutterBottom>
        Select
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Basic Select</InputLabel>
            <Select value="option1" label="Basic Select">
              <MenuItem value="option1">Option 1</MenuItem>
              <MenuItem value="option2">Option 2</MenuItem>
              <MenuItem value="option3">Option 3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Multiple Select</InputLabel>
            <Select
              multiple
              value={["option1", "option2"]}
              label="Multiple Select"
              renderValue={(selected) => selected.join(", ")}
            >
              <MenuItem value="option1">Option 1</MenuItem>
              <MenuItem value="option2">Option 2</MenuItem>
              <MenuItem value="option3">Option 3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
    <Box>
      <Typography variant="h5" gutterBottom>
        Autocomplete
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Autocomplete
        options={[
          "JavaScript",
          "TypeScript",
          "React",
          "Vue",
          "Angular",
          "Node.js",
        ]}
        renderInput={(params) => (
          <TextField {...params} label="Programming languages" />
        )}
        sx={{ mb: 2 }}
      />
      <Autocomplete
        multiple
        options={[
          "JavaScript",
          "TypeScript",
          "React",
          "Vue",
          "Angular",
          "Node.js",
        ]}
        defaultValue={["TypeScript", "React"]}
        renderInput={(params) => (
          <TextField {...params} label="Multiple values" />
        )}
      />
    </Box>
  </StoryContainer>
);

export const ElevationStory = () => (
  <StoryContainer>
    <Grid container spacing={2}>
      {[0, 1, 2, 3, 4, 6, 8, 12, 16, 24].map((elevation) => (
        <Grid item key={elevation} xs={6} sm={4} md={2}>
          <Paper
            elevation={elevation}
            sx={{
              p: 2,
              textAlign: "center",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Elevation {elevation}
          </Paper>
        </Grid>
      ))}
    </Grid>
  </StoryContainer>
);

export const CardStory = () => (
  <StoryContainer>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Card Title" subheader="September 14, 2023" />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              This is an example card with various elements you can include in a
              MUI Card component.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="sm">Share</Button>
            <Button size="sm">Learn More</Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" component="div">
              Outlined Card
            </Typography>
            <Typography variant="body2">
              A simpler card variant with an outline instead of elevation.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </StoryContainer>
);

export const ChipStory = () => (
  <StoryContainer>
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: 2 }}
    >
      <Chip label="Basic" />
      <Chip label="Disabled" disabled />
      <Chip label="Clickable" onClick={() => {}} />
      <Chip label="Deletable" onDelete={() => {}} />
      <Chip avatar={<Avatar>M</Avatar>} label="With Avatar" />
      <Chip icon={<Icon name="linechart" />} label="With Icon" />
    </Stack>
    <Typography variant="subtitle1" gutterBottom>
      Colors
    </Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip label="Default" />
      <Chip label="Primary" color="primary" />
      <Chip label="Secondary" color="secondary" />
      <Chip label="Success" color="success" />
      <Chip label="Error" color="error" />
      <Chip label="Info" color="info" />
      <Chip label="Warning" color="warning" />
    </Stack>
  </StoryContainer>
);

const KitchenSink = () => {
  return <div>Hello world</div>;
};

export default {
  component: KitchenSink,
  title: "ui",
  tags: ["autodocs", "e2e:autodocs-screenshot"],
  parameters: {
    layout: "centered",
    docs: {
      page: () => <StoryGrid cols={2} />,
    },
  },
};
