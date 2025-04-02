import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export const KitchenSink = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        MUI Kitchen Sink
      </Typography>

      {/* Typography Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Typography Variants
        </Typography>
        <Divider sx={{ mb: 2 }} />
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
      </Box>

      {/* Button Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Button Variants
        </Typography>
        <Divider sx={{ mb: 2 }} />
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
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </Stack>
      </Box>

      {/* Palette Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Palette
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {["primary", "secondary", "error", "warning", "info", "success"].map(
            (color) => (
              <Grid item key={color} xs={6} sm={4} md={2}>
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
      </Box>
    </Box>
  );
};

export default {
  component: KitchenSink,
  title: "ui/KitchenSink",
};
