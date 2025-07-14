import { t } from "@lingui/macro";
import { Box, BoxProps, Chip, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useEffect, useMemo, useState } from "react";

import { InfoDialogButton } from "src/components/info-dialog";
import { WikiPageSlug } from "src/domain/wiki";
import { Icon } from "src/icons";

export type ComboboxMultiProps = {
  id: string;
  label: React.ReactNode;
  items: string[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  minSelectedItems?: number;
  getItemLabel?: (item: string) => string;
  max?: number;
  colorful?: readonly string[];
  // For lazy combobox
  disabled?: boolean;
  error?: boolean;
  lazy?: boolean;
  onInputValueChange?: (inputValue: string) => void;
  isLoading?: boolean;
  isOptionEqualToValue?: (option: unknown, value: string) => boolean;
};

const defaultGetItemLabel = (d: string) => d;
const defaultOptionEqualToValue = (
  option: unknown,
  value: unknown
): boolean => {
  return option === value;
};

export const MultiCombobox = ({
  id,
  label,
  items,
  selectedItems,
  setSelectedItems,
  minSelectedItems = 0,
  getItemLabel = defaultGetItemLabel,
  isOptionEqualToValue = defaultOptionEqualToValue,
  lazy,
  onInputValueChange,
  isLoading,
  disabled,
  error,
  colorful,
  max,
}: ComboboxMultiProps) => {
  const [inputValue, setInputValue] = useState("");

  const canRemoveItems = selectedItems.length > minSelectedItems;

  return (
    <Autocomplete
      disabled={disabled}
      multiple
      id={id}
      options={items}
      value={selectedItems}
      onChange={(_, newValue) => {
        if (!max || newValue.length <= max) {
          setSelectedItems(newValue);
        }
      }}
      getOptionDisabled={(option) =>
        max !== undefined &&
        selectedItems.length >= max &&
        !selectedItems.includes(option)
      }
      sx={{
        width: "100%",
      }}
      popupIcon={<Icon name="chevrondown" color="black" />}
      renderInput={(params) => (
        <Box
          sx={{
            position: "relative",
            flexDirection: "column",
            width: "100%",
          }}
          display={"flex"}
        >
          <Typography
            sx={{ py: 2.5 }}
            color={"text.primary"}
            variant="h6"
            component="label"
          >
            {label}
          </Typography>
          <TextField
            {...params}
            variant="outlined"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onInputValueChange?.(e.target.value);
            }}
            error={error}
            helperText={
              max && selectedItems.length >= max
                ? t({
                    id: "combobox.maxitems",
                    message: "A maximum of {max} Entries are allowed",
                    values: { max },
                  })
                : undefined
            }
            InputProps={{
              ...params.InputProps,
            }}
          />
        </Box>
      )}
      noOptionsText={
        inputValue === "" && lazy
          ? t({ id: "combobox.prompt", message: "Enter designation ..." })
          : t({ id: "combobox.noitems", message: "No results" })
      }
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={`${key}-${id}-chip`}
              label={getItemLabel(option)}
              {...tagProps}
              sx={{
                backgroundColor: colorful
                  ? colorful[index % colorful.length]
                  : undefined,
              }}
              size="xs"
              disabled={disabled}
              onDelete={() =>
                canRemoveItems &&
                setSelectedItems(selectedItems.filter((d) => d !== option))
              }
            />
          );
        })
      }
      renderOption={(props, option) => (
        <li {...props} key={`${option}-${id}-selectable`}>
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
        return filteredOptions;
      }}
      getOptionLabel={(option) => getItemLabel(option)}
      onClose={() => {
        setInputValue("");
      }}
      isOptionEqualToValue={isOptionEqualToValue}
      disableClearable
      loading={isLoading}
    />
  );
};

export type ComboboxItem = string | { type: "header"; title: string };

export const Combobox = <T extends string>({
  id,
  label,
  items,
  selectedItem,
  setSelectedItem,
  infoDialogSlug,
  getItemLabel = defaultGetItemLabel,
  showLabel = true,
  disabled,
  error,
  sx,
}: {
  id: string;
  label: string;
  items: ComboboxItem[];
  selectedItem: T;
  setSelectedItem: (selectedItem: T) => void;
  getItemLabel?: (item: T) => string;
  showLabel?: boolean;
  infoDialogSlug?: WikiPageSlug;
  disabled?: boolean;
  error?: boolean;
  sx?: BoxProps["sx"];
}) => {
  const [inputValue, setInputValue] = useState(getItemLabel(selectedItem));

  useEffect(() => {
    setInputValue(getItemLabel(selectedItem));
  }, [getItemLabel, selectedItem]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => typeof item === "string");
  }, [items]);

  const groupsByLabel = useMemo(() => {
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
    <Box
      position="relative"
      flexDirection="column"
      width="100%"
      display="flex"
      sx={{
        gap: infoDialogSlug ? 0 : 2,
        ...sx,
      }}
    >
      <Box
        typography="meta"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {showLabel && (
          <Typography
            color={"text.primary"}
            variant="h6"
            component="label"
            htmlFor={`combobox-${id}`}
          >
            {label}
          </Typography>
        )}
        {infoDialogSlug && (
          <InfoDialogButton iconOnly slug={infoDialogSlug} label={label} />
        )}
      </Box>
      <Autocomplete
        id={`combobox-${id}`}
        disabled={disabled}
        options={filteredItems as T[]}
        groupBy={(option) => {
          return groupsByLabel[option];
        }}
        renderGroup={(params) => {
          return (
            <>
              {params.group ? (
                <Typography variant="caption" fontWeight={700} sx={{ mx: 4 }}>
                  {params.group}
                </Typography>
              ) : null}
              {params.children}
            </>
          );
        }}
        renderOption={(props, option, { selected }) => (
          <li
            {...props}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {getItemLabel(option)}
            {selected && <Icon name="checkmark" />}
          </li>
        )}
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
        blurOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            fullWidth
            error={error}
            InputProps={{
              ...params.InputProps,
            }}
          />
        )}
        noOptionsText={t({ id: "combobox.noitems", message: "No results" })}
        ListboxProps={{
          sx: {
            padding: 0,
          },
        }}
        slotProps={{
          paper: {
            sx: {
              marginTop: "0.25rem",
            },
          },
        }}
      />
    </Box>
  );
};
