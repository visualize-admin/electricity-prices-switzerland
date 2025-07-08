import {
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import CardGrid from "./card-grid";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CardGrid> = {
  title: "Components/CardGrid",
  component: CardGrid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

// Simple card component for demonstration
const DemoCard = ({
  title,
  color = "#f0f0f0",
}: {
  title: string;
  color?: string;
}) => (
  <Card
    sx={{
      bgcolor: color,
      height: "100%",
      display: "flex",
      minHeight: "100px",
    }}
  >
    <CardContent>
      <Typography variant="h6">{title}</Typography>
    </CardContent>
  </Card>
);

// Basic 3-column grid
export const Basic: Story = {
  render: () => (
    <CardGrid
      sx={{
        gridTemplateColumns: "repeat(3, 1fr)",
        gridAutoRows: "minmax(100px, auto)",
      }}
    >
      <DemoCard title="Card 1" color="#e3f2fd" />
      <DemoCard title="Card 2" color="#e8f5e9" />
      <DemoCard title="Card 3" color="#fff3e0" />
      <DemoCard title="Card 4" color="#f3e5f5" />
      <DemoCard title="Card 5" color="#e0f7fa" />
      <DemoCard title="Card 6" color="#fff8e1" />
    </CardGrid>
  ),
};

// Responsive grid with different column counts based on screen size
export const ResponsiveColumns: Story = {
  render: () => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only("xs"));
    const isSm = useMediaQuery(theme.breakpoints.only("sm"));
    const isMd = useMediaQuery(theme.breakpoints.only("md"));

    // Determine current breakpoint for display
    let currentBreakpoint = "lg or xl";
    if (isXs) currentBreakpoint = "xs";
    else if (isSm) currentBreakpoint = "sm";
    else if (isMd) currentBreakpoint = "md";

    return (
      <>
        <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
          Current breakpoint: {currentBreakpoint} - Resize window to see
          responsive behavior
        </Typography>

        <CardGrid
          sx={{
            gridTemplateColumns: {
              xs: "1fr", // 1 column on mobile
              sm: "repeat(2, 1fr)", // 2 columns on tablet
              md: "repeat(3, 1fr)", // 3 columns on desktop
              lg: "repeat(4, 1fr)", // 4 columns on large screens
            },
            gridAutoRows: "minmax(100px, auto)",
          }}
        >
          <DemoCard title="Card 1" color="#e3f2fd" />
          <DemoCard title="Card 2" color="#e8f5e9" />
          <DemoCard title="Card 3" color="#fff3e0" />
          <DemoCard title="Card 4" color="#f3e5f5" />
          <DemoCard title="Card 5" color="#e0f7fa" />
          <DemoCard title="Card 6" color="#fff8e1" />
          <DemoCard title="Card 7" color="#fce4ec" />
          <DemoCard title="Card 8" color="#f1f8e9" />
        </CardGrid>
      </>
    );
  },
};

// Dashboard-like layout with different card sizes
export const DashboardLayout: Story = {
  render: () => (
    <CardGrid
      sx={{
        gridTemplateColumns: "repeat(12, 1fr)",
        gridAutoRows: "minmax(100px, auto)",
      }}
    >
      <Card sx={{ gridColumn: "span 12", bgcolor: "#e3f2fd" }}>
        <CardContent>
          <Typography variant="h5">Header - Full Width (12 columns)</Typography>
        </CardContent>
      </Card>

      <Card
        sx={{ gridColumn: { xs: "span 12", md: "span 8" }, bgcolor: "#e8f5e9" }}
      >
        <CardContent>
          <Typography variant="h5">Main Content</Typography>
          <Typography variant="body2">
            8 columns on desktop, 12 on mobile
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          gridColumn: { xs: "span 12", md: "span 4" },
          bgcolor: "#fff3e0",
          gridRow: { md: "span 2" },
        }}
      >
        <CardContent>
          <Typography variant="h5">Sidebar</Typography>
          <Typography variant="body2">
            4 columns on desktop, spans 2 rows, 12 columns on mobile
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" },
          bgcolor: "#f3e5f5",
        }}
      >
        <CardContent>
          <Typography variant="h5">Card 1</Typography>
          <Typography variant="body2">
            4 columns on desktop, 6 on tablet, 12 on mobile
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" },
          bgcolor: "#e0f7fa",
        }}
      >
        <CardContent>
          <Typography variant="h5">Card 2</Typography>
          <Typography variant="body2">
            4 columns on desktop, 6 on tablet, 12 on mobile
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ gridColumn: "span 12", bgcolor: "#fff8e1" }}>
        <CardContent>
          <Typography variant="h5">Footer - Full Width (12 columns)</Typography>
        </CardContent>
      </Card>
    </CardGrid>
  ),
};
