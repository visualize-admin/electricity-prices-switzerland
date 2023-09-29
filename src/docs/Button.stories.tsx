import { Button } from "@mui/material";

export const Primary = () => (
  <Button variant="contained" color="primary">
    Primary
  </Button>
);

export const Secondary = () => (
  <Button variant="contained" color="secondary">
    Secondary
  </Button>
);

export const Success = () => (
  <Button variant="contained" color="success">
    Success
  </Button>
);

export const Outlined = () => <Button variant="outlined">Outlined</Button>;

export default {
  title: "Components / Button",
  component: Button,
};
