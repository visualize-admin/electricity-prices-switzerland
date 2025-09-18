import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  Paper,
} from "@mui/material";
import React from "react";

import { getFlagInfo } from "src/session-config/flags";
import { SessionConfigFlags } from "src/session-config/flags";

interface FlagInputProps {
  flagKey: string;
  value: unknown;
  type: string;
  description: string;
}

const FlagInput: React.FC<FlagInputProps> = ({
  flagKey,
  value,
  type,
  description,
}) => {
  const renderInput = () => {
    switch (type) {
      case "boolean":
        return (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  name={`flags.${flagKey}`}
                  value="true"
                  defaultChecked={!!value}
                />
              }
              label="Enabled"
            />
            <input type="hidden" name={`flags.${flagKey}`} value="false" />
          </Box>
        );

      case "enum":
        const options = getFlagInfo(
          flagKey as keyof SessionConfigFlags
        ).options.map((x) => x.value);
        return (
          <FormControl fullWidth>
            <Select
              name={`flags.${flagKey}`}
              defaultValue={String(value)}
              variant="outlined"
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return (
          <TextField
            name={`flags.${flagKey}`}
            defaultValue={String(value)}
            fullWidth
            variant="outlined"
          />
        );
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 3,
        p: 3,
        bgcolor: "grey.50",
        border: 1,
        borderColor: "grey.200",
      }}
    >
      <Typography
        variant="h6"
        component="label"
        htmlFor={flagKey}
        sx={{ mb: 1 }}
      >
        {flagKey}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, display: "block" }}
      >
        {description}
      </Typography>
      <Box>{renderInput()}</Box>
    </Paper>
  );
};

export default FlagInput;
