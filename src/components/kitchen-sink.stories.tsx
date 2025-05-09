import {
  Button,
  ButtonProps,
  capitalize,
  Chip,
  ChipProps,
  Grid,
  IconButton,
  Link,
  Stack,
} from "@mui/material";
import { useState } from "react";

import { StoryGrid } from "src/components/storybook/story-grid";
import { getIconSize, Icon } from "src/icons";
import { chartPalette, palette } from "src/themes/palette";

import { AnchorNav } from "./anchor-nav";
import { Combobox, ComboboxMulti } from "./combobox";
import { RadioTabs } from "./radio-tabs";
import {
  ColorPaletteStack,
  ColorSwatch,
  DesignGrid,
  DesignSection,
  DesignStory,
  ElevationStack,
  TypographyStack,
} from "./storybook/base-style";

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
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.sequential.orange.map((value) => (
              <ColorSwatch
                key={`sequential-orange-${value}`}
                swatch={{ [""]: value }}
                color="Orange"
              />
            ))}
          </Stack>
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.sequential.yellow.map((value) => (
              <ColorSwatch
                key={`sequential-yellow-${value}`}
                swatch={{ [""]: value }}
                color="Yellow"
              />
            ))}
          </Stack>
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.sequential.green.map((value) => (
              <ColorSwatch
                key={`sequential-green-${value}`}
                swatch={{ [""]: value }}
                color="Green"
              />
            ))}
          </Stack>
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.sequential.teal.map((value) => (
              <ColorSwatch
                key={`sequential-teal-${value}`}
                swatch={{ [""]: value }}
                color="Teal"
              />
            ))}
          </Stack>
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.sequential.blue.map((value) => (
              <ColorSwatch
                key={`sequential-blue-${value}`}
                swatch={{ [""]: value }}
                color="Blue"
              />
            ))}
          </Stack>
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.sequential.indigo.map((value) => (
              <ColorSwatch
                key={`sequential-indigo-${value}`}
                swatch={{ [""]: value }}
                color="Indigo"
              />
            ))}
          </Stack>
        </ColorPaletteStack>
        <ColorPaletteStack
          title="Diverging Colors"
          sx={{
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.diverging.GreenToOrange.map((value) => (
              <ColorSwatch
                key={`sequential-grToOr-${value}`}
                swatch={{ [""]: value }}
                color="Green to Orange"
              />
            ))}
          </Stack>
          <Stack spacing={4.5} direction={"row"}>
            {chartPalette.diverging.BlueToPink.map((value) => (
              <ColorSwatch
                key={`sequential-blToPk-${value}`}
                swatch={{ [""]: value }}
                color="Blue to Pink"
              />
            ))}
          </Stack>
        </ColorPaletteStack>
      </DesignSection>
    </DesignStory>
  );
};

export const ElevationStory = () => (
  <DesignStory title="Elevation" reference="BUND Library">
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map((elevation) => (
        <Grid item key={elevation} xs={6} sm={4} md={2}>
          <ElevationStack elevation={elevation} />
        </Grid>
      ))}
    </Grid>
  </DesignStory>
);

const buttonStates = ["enabled", "disabled"];
const buttonSizes: ButtonProps["size"][] = ["xl", "lg", "md", "sm"];

export const ButtonStory = () => {
  return (
    <DesignStory title="Buttons" reference="BUND Library">
      <DesignSection title="Outline">
        <Stack direction="row" spacing={6} flexWrap="wrap" useFlexGap>
          {buttonStates.map((state, index) => {
            return (
              <Stack
                key={`${state}-${index}`}
                direction={"column"}
                alignItems={"center"}
                spacing={4}
              >
                {buttonSizes.map((size) => (
                  <Button
                    key={`${size}-${state}-${index}`}
                    variant="outlined"
                    color="primary"
                    size={size}
                    disabled={state === "disabled"}
                  >
                    Button Text
                  </Button>
                ))}
              </Stack>
            );
          })}
          {buttonStates.map((state, index) => {
            return (
              <Stack
                key={`${state}-${index}`}
                direction={"column"}
                alignItems={"center"}
                spacing={4}
              >
                {buttonSizes.map((size) => (
                  <IconButton
                    key={`${size}-${state}-${index}`}
                    color="primary"
                    size={size}
                    variant="outlined"
                    disabled={state === "disabled"}
                  >
                    <Icon name="arrowright" size={getIconSize(size)} />
                  </IconButton>
                ))}
              </Stack>
            );
          })}
        </Stack>
      </DesignSection>
      <DesignSection title="Contained">
        <Stack direction="row" spacing={6} flexWrap="wrap" useFlexGap>
          {buttonStates.map((state, index) => {
            return (
              <Stack
                key={`${state}-${index}`}
                direction={"column"}
                alignItems={"center"}
                spacing={4}
              >
                {buttonSizes.map((size) => (
                  <Button
                    key={`${size}-${state}-${index}`}
                    variant="contained"
                    color="secondary"
                    size={size}
                    disabled={state === "disabled"}
                  >
                    Button Text
                  </Button>
                ))}
              </Stack>
            );
          })}
          {buttonStates.map((state, index) => {
            return (
              <Stack
                key={`${state}-${index}`}
                direction={"column"}
                alignItems={"center"}
                spacing={4}
              >
                {buttonSizes.map((size) => (
                  <IconButton
                    key={`${size}-${state}-${index}`}
                    color="secondary"
                    size={size}
                    variant="contained"
                    disabled={state === "disabled"}
                  >
                    <Icon name="arrowright" size={getIconSize(size)} />
                  </IconButton>
                ))}
              </Stack>
            );
          })}
        </Stack>
      </DesignSection>
      <DesignSection title="Text">
        <Stack direction="row" spacing={6} flexWrap="wrap" useFlexGap>
          {buttonStates.map((state, index) => {
            return (
              <Stack
                key={`${state}-${index}`}
                direction={"column"}
                alignItems={"center"}
                spacing={4}
              >
                {buttonSizes.map((size) => (
                  <Button
                    key={`${size}-${state}-${index}`}
                    variant="text"
                    color="tertiary"
                    size={size}
                    disabled={state === "disabled"}
                  >
                    Button Text
                  </Button>
                ))}
              </Stack>
            );
          })}
          {buttonStates.map((state, index) => {
            return (
              <Stack
                key={`${state}-${index}`}
                direction={"column"}
                alignItems={"center"}
                spacing={4}
              >
                {buttonSizes.map((size) => (
                  <IconButton
                    key={`${size}-${state}-${index}`}
                    color="tertiary"
                    size={size}
                    variant="text"
                    disabled={state === "disabled"}
                  >
                    <Icon name="arrowright" size={getIconSize(size)} />
                  </IconButton>
                ))}
              </Stack>
            );
          })}
        </Stack>
      </DesignSection>
      <DesignSection title="Link Primary" note="Currently not working!">
        <Stack
          direction={"column"}
          spacing={4}
          alignItems={"center"}
          width={"fit-content"}
        >
          {buttonSizes.map((size) => (
            <Link
              href="#"
              component={"a"}
              key={`${size}-link`}
              color="primary"
              size={size}
            >
              Button Text
            </Link>
          ))}
        </Stack>
      </DesignSection>
      <DesignSection title="Link Secondary" note="Currently not working!">
        <Stack
          direction={"column"}
          spacing={4}
          alignItems={"center"}
          width={"fit-content"}
        >
          {buttonSizes.map((size) => (
            <Link
              href="#"
              component={"a"}
              key={`${size}-link`}
              color="tertiary"
              size={size}
            >
              Button Text
            </Link>
          ))}
        </Stack>
      </DesignSection>
    </DesignStory>
  );
};

const chipSizes: ChipProps["size"][] = ["xl", "lg", "md", "sm", "xs"];

export const ChipStory = () => (
  <DesignStory title="Chip" reference="BUND Library">
    <DesignGrid>
      <DesignSection
        title="Enabled"
        sx={{
          gap: 4,
          alignItems: "center",
          width: "fit-content",
        }}
      >
        <Stack direction="row" spacing={6} flexWrap="wrap" useFlexGap>
          <Stack direction={"column"} alignItems={"center"} spacing={4}>
            {chipSizes.map((size) => (
              <Chip key={`enabled-${size}`} label={"Tag label"} size={size} />
            ))}
          </Stack>
          <Stack direction={"column"} alignItems={"center"} spacing={4}>
            {chipSizes.map((size) => (
              <Chip
                key={`delete-enabled-${size}`}
                label={"Tag label"}
                size={size}
                onDelete={() => {}}
              />
            ))}
          </Stack>
        </Stack>
      </DesignSection>
      <DesignSection
        title="Disabled"
        sx={{
          gap: 4,
          alignItems: "center",
          width: "fit-content",
        }}
      >
        <Stack direction="row" spacing={6} flexWrap="wrap" useFlexGap>
          <Stack direction={"column"} alignItems={"center"} spacing={4}>
            {chipSizes.map((size) => (
              <Chip
                key={`disabled-${size}`}
                label={"Tag label"}
                disabled
                size={size}
              />
            ))}
          </Stack>
          <Stack direction={"column"} alignItems={"center"} spacing={4}>
            {chipSizes.map((size) => (
              <Chip
                key={`delete-disabled-${size}`}
                label={"Tag label"}
                size={size}
                disabled
                onDelete={() => {}}
              />
            ))}
          </Stack>
        </Stack>
      </DesignSection>
    </DesignGrid>
  </DesignStory>
);

export const RadioTabsStory = () => {
  const [radioTabsValue, setRadioTabsValue] = useState<string>("label-1");

  return (
    <DesignStory title="Radio Tabs" reference="BUND Library">
      <DesignSection title="Base" sx={{ maxWidth: 300 }}>
        <RadioTabs
          id="storybook-radio-tabs"
          options={[
            { label: "Label", value: "label-1" },
            { label: "Label", value: "label-2" },
            { label: "Label", value: "label-3" },
          ]}
          value={radioTabsValue}
          setValue={setRadioTabsValue}
        />
      </DesignSection>
    </DesignStory>
  );
};

const selectStates = ["enabled", "disabled", "error"];
const selectItems = ["tag 1", "tag 2", "tag 3", "tag 4", "tag 5", "tag 6"];

export const FormStory = () => {
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([
    "tag 1",
    "tag 2",
    "tag 3",
  ]);
  const [selectValue, setSelectValue] = useState<string>("tag 1");
  return (
    <DesignStory title="Form Elements" reference="BUND Library">
      <DesignGrid>
        <DesignSection
          title="Select"
          note="Currently using Combobox + Autocomplete Component!"
          sx={{
            gap: 8,
            maxWidth: 300,
          }}
        >
          {selectStates.map((state) => (
            <Combobox
              key={state}
              id={`select-${state}`}
              label={capitalize(state)}
              disabled={state === "disabled"}
              error={state === "error"}
              items={selectItems}
              setSelectedItem={setSelectValue}
              selectedItem={selectValue}
            />
          ))}
        </DesignSection>
        <DesignSection
          title="Multi-Select"
          note="Currently using ComboboxMulti + Autocomplete Component!"
          sx={{
            gap: 8,
            maxWidth: 300,
          }}
        >
          {selectStates.map((state) => (
            <ComboboxMulti
              key={state}
              id={`multi-select-${state}`}
              disabled={state === "disabled"}
              error={state === "error"}
              label={capitalize(state)}
              items={selectItems}
              setSelectedItems={setMultiSelectValue}
              selectedItems={multiSelectValue}
            />
          ))}
        </DesignSection>
      </DesignGrid>
    </DesignStory>
  );
};

const anchorNavStates = ["enabled", "active", "disabled", "tag"];

export const NavigationStory = () => {
  return (
    <DesignStory title="Navigation" reference="BUND Library">
      <DesignGrid>
        <DesignSection
          title="AnchorNav"
          sx={{
            maxWidth: 400,
          }}
        >
          {anchorNavStates.map((state) => (
            <AnchorNav
              href={"#"}
              key={`anchor-nav-${state}`}
              label={"Label"}
              active={state === "active"}
              disabled={state === "disabled"}
              tag={state === "tag" ? <Chip label="Tag" size="xs" /> : undefined}
              size="lg"
              icon={<Icon name="arrowright" />}
            />
          ))}
          {anchorNavStates.map((state) => (
            <AnchorNav
              href={"#"}
              key={`anchor-nav-${state}`}
              label={"Label"}
              active={state === "active"}
              disabled={state === "disabled"}
              tag={state === "tag" ? <Chip label="Tag" size="xs" /> : undefined}
              size="sm"
              icon={<Icon name="arrowright" />}
            />
          ))}
        </DesignSection>
      </DesignGrid>
    </DesignStory>
  );
};

export default {
  component: () => {},
  title: "ui",
  tags: ["autodocs", "e2e:autodocs-screenshot"],
  parameters: {
    layout: "centered",
    docs: {
      page: () => <StoryGrid cols={2} />,
    },
  },
};
