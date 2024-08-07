import { t } from "@lingui/macro";
// import { i18n } from "@lingui/core";
import { Box, InputBase, IconButton, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useCombobox } from "downshift";
import { useState, useEffect } from "react";

import { Icon } from "../icons";

import { Label } from "./form";
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
            sx={{ bgcolor: "grey.100" }}
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

export const Combobox = ({
  id,
  label,
  items,
  selectedItem,
  setSelectedItem,
  infoDialogSlug,
  getItemLabel = defaultGetItemLabel,
  showLabel = true,
}: {
  id: string;
  label: string;
  items: (string | { type: "header"; title: string })[];
  selectedItem: string;
  setSelectedItem: (selectedItem: string) => void;
  getItemLabel?: (item: string) => string;
  showLabel?: boolean;
  infoDialogSlug?: string;
}) => {
  const [inputValue, setInputValue] = useState(getItemLabel(selectedItem));

  const getFilteredItems = () => {
    return inputValue && inputValue !== getItemLabel(selectedItem)
      ? items.filter((item) =>
          typeof item !== "string"
            ? true
            : getItemLabel(item)
                .toLowerCase()
                .startsWith(inputValue.toLowerCase())
        )
      : items;
  };

  // Update  when locale changes
  useEffect(() => {
    setInputValue(getItemLabel(selectedItem));
  }, [getItemLabel, selectedItem]);

  const inputItems = getFilteredItems();

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
  } = useCombobox({
    id: `combobox-${id}`,
    inputValue,
    selectedItem,
    items: inputItems,
    onStateChange: (changes: $FixMe) => {
      switch (changes.type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(changes.inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (changes.selectedItem) {
            setInputValue(getItemLabel(changes.inputValue));
            setSelectedItem(changes.inputValue);
          }
          break;
        case useCombobox.stateChangeTypes.InputBlur:
          setInputValue(getItemLabel(selectedItem));
          break;
        default:
          break;
      }
    },
  });

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{ justifyContent: "space-between", alignItems: "center" }}
        display="flex"
      >
        <Label
          showLabel={showLabel}
          label={label}
          smaller
          {...getLabelProps()}
        ></Label>
        {infoDialogSlug ? (
          <InfoDialogButton
            iconOnly
            slug={infoDialogSlug}
            label={label}
            smaller
          />
        ) : null}
      </Box>
      <Box
        sx={{
          display: "block",
          width: "100%",
          py: 0,
          pl: 2,
          pr: 6,
          height: 48,

          appearance: "none",
          fontSize: "inherit",
          lineHeight: "inherit",
          border: "1px solid",
          borderRadius: 1,
          color: "text",
          borderColor: isOpen ? "primary.main" : "grey.500",
          bgcolor: "grey.100",
          flexWrap: "wrap",
          "&:focus-within": { borderColor: "primary.main" },
          position: "relative",
        }}
        display="flex"
      >
        <Box
          {...getComboboxProps()}
          sx={{ flexGrow: 1, minWidth: 80, alignSelf: "center", my: 2 }}
        >
          <InputBase
            {...getInputProps({
              onFocus: (e) => {
                e.currentTarget.select();
              },
              onClick: () => {
                openMenu();
              },
            })}
            sx={{
              display: "block",
              // width: "100%",
              appearance: "none",
              fontSize: "inherit",
              lineHeight: "inherit",
              border: "none",
              color: "text",
              bgcolor: "transparent",
              borderRadius: 0,
              p: 0,
              "&:focus": { outline: 0 },
            }}
          />
        </Box>
        <IconButton
          aria-label={"toggle menu"}
          variant="reset"
          size="small"
          sx={{
            color: "grey.800",
            p: 0,
            mr: 1,
            position: "absolute",
            right: 0,
            top: "50%",
            height: 40,
            width: 40,
            transition: "transform 0.1s ease",
            transformOrigin: "center center",
            transform: ` translateY(-50%) rotate(${
              !isOpen ? "0deg" : "180deg"
            })`,
          }}
          {...getToggleButtonProps()}
        >
          <Icon name="chevrondown" />
        </IconButton>
      </Box>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          borderRadius: 1,
          boxShadow: "tooltip",
          bgcolor: "grey.100",
          mt: 1,
          p: 0,
          position: "absolute",
          width: "100%",
          zIndex: 999,
        }}
        style={{ display: isOpen ? "block" : "none", overflow: "hidden" }}
        {...getMenuProps()}
      >
        {isOpen &&
          inputItems.map((item, index) =>
            typeof item === "string" ? (
              <Box
                component="li"
                sx={{
                  color: highlightedIndex === index ? "primary.active" : "text",
                  bgcolor:
                    highlightedIndex === index
                      ? "primary.light"
                      : "transparent",
                  p: 3,
                  m: 0,
                }}
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                {getItemLabel(item)}
              </Box>
            ) : (
              <Box
                component="li"
                sx={{
                  fontWeight: "bold",
                  py: 1,
                  px: 3,
                  marginTop: "0.5rem",
                }}
              >
                {item.title}
              </Box>
            )
          )}
        {isOpen && inputItems.length === 0 && (
          <Box
            component="li"
            sx={{
              color: "secondary.main",
              p: 3,
              m: 0,
            }}
          >
            {t({ id: "combobox.noitems", message: `Keine Einträge` })}
          </Box>
        )}
      </Box>
    </Box>
  );
};
