import { t } from "@lingui/macro";
// import { i18n } from "@lingui/core";
import { Box, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useState, useEffect, useMemo } from "react";

import { Icon } from "../icons";

import { InfoDialogButton } from "./info-dialog";
export type ComboboxMultiProps = {
  id: string;
  label: React.ReactNode;
  items: string[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  minSelectedItems?: number;
  getItemLabel?: (item: string) => string;
  // For lazy combobox
  lazy?: boolean;
  onInputValueChange?: (inputValue: string) => void;
  isLoading?: boolean;
};

const defaultGetItemLabel = (d: string) => d;

export const ComboboxMulti = ({
  id,
  label,
  items,
  selectedItems,
  setSelectedItems,
  minSelectedItems = 0,
  getItemLabel = defaultGetItemLabel,
  lazy,
  onInputValueChange,
  isLoading,
}: ComboboxMultiProps) => {
  const [inputValue, setInputValue] = useState("");

  const canRemoveItems = selectedItems.length > minSelectedItems;

  return (
    <Autocomplete
      multiple
      id={id}
      options={items}
      value={selectedItems}
      onChange={(event, newValue) => {
        setSelectedItems(newValue);
      }}
      popupIcon={<Icon name="chevrondown" color="black" />}
      renderInput={(params) => (
        <>
          <Typography variant="meta">{label}</Typography>
          <TextField
            {...params}
            sx={{ bgcolor: "grey.100" } as TextFieldProps}
            variant="outlined"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onInputValueChange && onInputValueChange(e.target.value);
            }}
            InputProps={{
              ...params.InputProps,
            }}
          />
        </>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Box
              key={key}
              sx={{
                display: "inline-block",
                p: 1,
                mr: 2,
                mb: 2,
                borderRadius: 1,
                fontSize: "0.75rem",
                bgcolor: "primary.light",
                "&:focus": {
                  outline: 0,
                  bgcolor: "primary.main",
                  color: "grey.100",
                },
              }}
              {...tagProps}
            >
              {getItemLabel(option)}{" "}
              {canRemoveItems && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItems(selectedItems.filter((d) => d !== option));
                  }}
                >
                  &#10005;
                </span>
              )}
            </Box>
          );
        })
      }
      renderOption={(props, option) => (
        <li {...props} key={option}>
          {getItemLabel(option)}
        </li>
      )}
      filterOptions={(options, state) => {
        const filteredOptions = options.filter(
          (option) =>
            selectedItems.indexOf(option) < 0 &&
            getItemLabel(option)
              .toLowerCase()
              .startsWith(state.inputValue.toLowerCase())
        );
        if (filteredOptions.length === 0 && state.inputValue !== "" && lazy) {
          filteredOptions.push(state.inputValue);
        }
        return filteredOptions;
      }}
      getOptionLabel={(option) => getItemLabel(option)}
      onClose={() => {
        setInputValue("");
      }}
      isOptionEqualToValue={(option, value) => option === value}
      disableClearable
      loading={isLoading}
    />
  );
};

interface ComboboxProps {
  id: string;
  label: string;
  items: (string | { type: "header"; title: string })[];
  selectedItem: string;
  setSelectedItem: (selectedItem: string) => void;
  getItemLabel?: (item: string) => string;
  showLabel?: boolean;
  infoDialogSlug?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  id,
  label,
  items,
  selectedItem,
  setSelectedItem,
  infoDialogSlug,
  getItemLabel = defaultGetItemLabel,
  showLabel = true,
}) => {
  const [inputValue, setInputValue] = useState(getItemLabel(selectedItem));

  useEffect(() => {
    setInputValue(getItemLabel(selectedItem));
  }, [getItemLabel, selectedItem]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => typeof item === "string");
  }, [items]);

  const groupsBylabel = useMemo(() => {
    const res: Record<string, string> = {};
    let currentGroup = null;
    for (const item of items) {
      if (typeof item === "string") {
        if (!currentGroup) {
          continue;
        }
        res[item] = currentGroup;
      } else {
        currentGroup = item.title;
      }
    }
    return res;
  }, [items]);

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        typography="meta"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {showLabel && <label htmlFor={`combobox-${id}`}>{label}</label>}
        {infoDialogSlug && (
          <InfoDialogButton
            iconOnly
            slug={infoDialogSlug}
            label={label}
            smaller
          />
        )}
      </Box>
      <Autocomplete
        id={`combobox-${id}`}
        options={filteredItems as string[]}
        groupBy={(option) => {
          return groupsBylabel[option];
        }}
        renderGroup={(params) => {
          return (
            <>
              <Typography variant="meta" fontWeight="bold" sx={{ mx: 4 }}>
                {params.group}
              </Typography>
              {params.children}
            </>
          );
        }}
        popupIcon={<Icon name="chevrondown" color="black" />}
        getOptionLabel={getItemLabel}
        disableClearable
        value={selectedItem}
        onChange={(_, newValue) => {
          if (newValue) {
            setSelectedItem(newValue);
          }
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              sx: {
                height: 48,
                bgcolor: "grey.100",
                "&:focus-within": { borderColor: "primary.main" },
              },
            }}
          />
        )}
        noOptionsText={t({ id: "combobox.noitems", message: "Keine Einträge" })}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "grey.500",
            },
            "&:hover fieldset": {
              borderColor: "grey.700",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
            },
          },
        }}
      />
    </Box>
  );
};
