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

import { StoryGrid } from "src/components/storybook/StoryGrid";
import { IconAreaChart } from "src/icons/ic-area-chart";

const StoryContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box p={6} sx={{ "& > * + *": { mt: 2 } }}>
      {children}
    </Box>
  );
};

export const TypographyStory = () => (
  <StoryContainer>
    <Typography variant="h1">h1. Heading</Typography>
    <Typography variant="h2">h2. Heading</Typography>
    <Typography variant="h3">h3. Heading</Typography>
    <Typography variant="h4">h4. Heading</Typography>
    <Typography variant="h5">h5. Heading</Typography>
    <Typography variant="h6">h6. Heading</Typography>
    <Typography variant="subtitle1">
      subtitle1. Lorem ipsum dolor sit amet
    </Typography>
    <Typography variant="subtitle2">
      subtitle2. Lorem ipsum dolor sit amet
    </Typography>
    <Typography variant="body1">
      body1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </Typography>
    <Typography variant="body2">
      body2. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </Typography>
    <Typography variant="button" display="block">
      button text
    </Typography>
    <Typography variant="caption" display="block">
      caption text
    </Typography>
    <Typography variant="overline" display="block">
      overline text
    </Typography>
  </StoryContainer>
);

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
      <Button color="green" variant="contained">
        Success
      </Button>
      <Button color="red" variant="contained">
        Error
      </Button>
      <Button color="blue" variant="contained">
        Info
      </Button>
      <Button color="yellow" variant="contained">
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

export const PaletteSection = () => (
  <StoryContainer>
    <Grid container spacing={2}>
      {["primary", "secondary", "error", "warning", "info", "success"].map(
        (color) => (
          <Grid item key={color} xs={6} sm={4} md={4}>
            <Paper
              sx={{
                p: 2,
                bgcolor: `${color}.main`,
                color: `${color}.contrastText`,
                textAlign: "center",
              }}
              elevation={3}
            >
              {color}
            </Paper>
            <Paper
              sx={{
                p: 2,
                bgcolor: `${color}.light`,
                color: "text.primary",
                textAlign: "center",
                mt: 1,
              }}
              elevation={1}
            >
              {color}.light
            </Paper>
            <Paper
              sx={{
                p: 2,
                bgcolor: `${color}.dark`,
                color: "white",
                textAlign: "center",
                mt: 1,
              }}
              elevation={1}
            >
              {color}.dark
            </Paper>
          </Grid>
        )
      )}
    </Grid>
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
      <Chip icon={<IconAreaChart />} label="With Icon" />
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
