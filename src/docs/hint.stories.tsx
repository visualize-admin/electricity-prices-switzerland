import { Box, Paper, Typography } from "@mui/material";

import {
  Hint,
  HintBlue,
  HintRed,
  Loading,
  LoadingIcon,
  LoadingIconInline,
  NoGeoDataHint,
} from "src/components/hint";

const ComponentSpecimen = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Paper sx={{ p: 5 }} elevation={6}>
      <Typography variant="h6" display="block" mb={2}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

export const Hints = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
        gridTemplateRows: "auto",
      }}
    >
      <ComponentSpecimen title={"Hint"}>
        <Hint>A default hint.</Hint>
      </ComponentSpecimen>

      <ComponentSpecimen title={"HintBlue"}>
        <HintBlue iconName="check">A blue hint</HintBlue>
      </ComponentSpecimen>

      <ComponentSpecimen title={"HintRed"}>
        <HintRed iconName={"column"}>A red hint</HintRed>
      </ComponentSpecimen>

      <ComponentSpecimen title={"NoGeoDataHint"}>
        <NoGeoDataHint />
      </ComponentSpecimen>

      <ComponentSpecimen title={"LoadingIcon"}>
        <LoadingIcon />
      </ComponentSpecimen>

      <ComponentSpecimen title={"LoadingIconInline"}>
        <LoadingIconInline />
      </ComponentSpecimen>

      <ComponentSpecimen title={"Loading"}>
        <Loading />
      </ComponentSpecimen>
    </Box>
  );
};

export default {
  title: "Components / Hints",
  component: Hint,
};
