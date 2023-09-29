import { t } from "@lingui/macro";
// import { i18n } from "@lingui/core";
import { Box, IconButton, Input, Typography } from "@mui/material";
import { useCombobox, useMultipleSelection } from "downshift";
import { useState, useEffect } from "react";

import Flex from "src/components/flex";
import { makeStyles } from "src/themes/makeStyles";

import { Icon } from "../icons";

import { Label } from "./form";
import { InfoDialogButton } from "./info-dialog";

const useComboboxStyles = makeStyles()((theme) => ({
  listItem2: {
    fontWeight: "bold",
    padding: theme.spacing(1, 3),
    marginTop: "0.5rem",
  },
  listItem: {
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
    padding: theme.spacing(3),
    margin: 0,
  },
  listItemActive: {
    color: theme.palette.primary.active,
    backgroundColor: theme.palette.primary.light,
  },
  list: {
    listStyle: "none",
    borderRadius: theme.shape.borderRadius * 3,
    boxShadow: theme.shadows[6],
    backgroundColor: theme.palette.grey[100],
    marginTop: theme.spacing(1),
    padding: 0,
    position: "absolute",
    width: "100%",
    zIndex: 999,
  },
  toggleMenu: {
    color: theme.palette.grey[800],
    padding: 0,
    marginRight: 1,
    width: 48,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: "50%",
    height: 48,
    transform: "translateY(-50%)",
  },
  input: {
    display: "flex",
    width: "100%",
    appearance: "none",
    fontSize: "inherit",
    lineHeight: "inherit",
    border: "none",
    color: "text",
    backgroundColor: "transparent",
    borderRadius: 0,
    height: "100%",
    alignItems: "center",
    padding: 0,
    "&.Mui-focused": { outline: 0 },
  },
  inputContainer: {
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    padding: theme.spacing(0, 2),

    height: 48,
    alignItems: "center",

    appearance: "none",
    fontSize: "inherit",
    lineHeight: "inherit",
    border: "1px solid",
    borderRadius: 4,
    color: "text",
    backgroundColor: theme.palette.grey[100],
    flexWrap: "wrap",
    ":focus-within": { borderColor: theme.palette.primary.main },
    position: "relative",
    borderColor: theme.palette.grey[500],
  },

  inputContainerOpen: {
    borderColor: theme.palette.primary.main,
  },
}));

const useMultiComboboxStyles = makeStyles()((theme) => ({
  filteredItem: {
    padding: theme.spacing(3),
    margin: 0,
  },
  filteredItemActive: {
    color: "primary.active",
    backgroundColor: theme.palette.primary.light,
  },
  list: {
    listStyle: "none",
    borderRadius: "default",
    boxShadow: theme.shadows[6],
    backgroundColor: theme.palette.grey[100],
    marginTop: theme.spacing(1),
    padding: 0,
    position: "absolute",
    width: "100%",
    zIndex: 999,
  },
  toggleButton: {
    color: theme.palette.grey[800],
    padding: 0,
    marginRight: theme.spacing(2),
    position: "absolute",
    right: 0,
    top: "50%",
    minWidth: "24px",
    height: 24,
    transform: "translateY(-50%)",
  },
  input: {
    height: "100%",
    "&.Mui-focused": {
      outline: "none",
    },
    fontSize: "inherit",
    lineHeight: "inherit",
    border: "none",
    color: "text",
    borderRadius: 0,
    padding: 0,
  },
  combobox: {
    flexGrow: 1,
    minWidth: 30,
    flexBasis: 0,
    alignSelf: "center",
  },
  tagItem: {
    display: "inline-block",
    padding: theme.spacing(1),
    marginRight: theme.spacing(2),
    borderRadius: "default",
    fontSize: "0.75rem",
    backgroundColor: theme.palette.primary.light,
    ":focus": {
      outline: 0,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.grey[100],
    },
  },
  inputContainer: {
    display: "flex",
    width: "100%",
    minHeight: 48,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(6),
    boxSizing: "border-box",
    alignItems: "center",
    appearance: "none",
    fontSize: "inherit",
    lineHeight: "inherit",
    border: "1px solid",
    borderRadius: theme.shape.borderRadius * 2,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.grey[100],
    flexWrap: "wrap",
    "&.Mui-focused": { borderColor: theme.palette.primary.main },
    position: "relative",
  },
  inputContainerOpen: {
    borderColor: theme.palette.primary.main,
  },
}));

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

  const { getSelectedItemProps, getDropdownProps } = useMultipleSelection({
    selectedItems,
    onSelectedItemsChange: (props) => {
      if (canRemoveItems) {
        setSelectedItems(props.selectedItems ?? []);
      }
    },
  });

  const getFilteredItems = (_items: string[]) =>
    lazy
      ? inputValue !== ""
        ? _items.filter((item) => selectedItems.indexOf(item) < 0)
        : []
      : _items.filter(
          (item) =>
            selectedItems.indexOf(item) < 0 &&
            getItemLabel(item)
              .toLowerCase()
              .startsWith(inputValue.toLowerCase())
        );

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
    id: `combobox-multi-${id}`,
    inputValue,
    defaultHighlightedIndex: 0,
    selectedItem: null,
    items: getFilteredItems(items),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
          };
      }
      return changes;
    },
    onStateChange: ({ inputValue, type, selectedItem }: $FixMe) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue);
          onInputValueChange?.(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            setInputValue("");
            setSelectedItems([...selectedItems, selectedItem]);
          }
          break;
        case useCombobox.stateChangeTypes.InputBlur:
          setInputValue("");
          break;
        default:
          break;
      }
    },
  });

  const { classes, cx } = useMultiComboboxStyles();

  return (
    <Box sx={{ position: "relative" }}>
      <Label label={label} smaller {...getLabelProps()}></Label>
      <Flex
        className={cx(
          classes.inputContainer,
          isOpen && classes.inputContainerOpen
        )}
      >
        <Box>
          {selectedItems.map((selectedItem, index) => (
            <Box
              key={`selected-item-${index}`}
              {...getSelectedItemProps({
                selectedItem,
                index,
                onKeyDown: (e) => {
                  // Prevent default, otherwise Firefox navigates back when Delete is pressed
                  e.preventDefault();
                },
              })}
              className={classes.tagItem}
            >
              {getItemLabel(selectedItem)}{" "}
              {canRemoveItems && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItems(
                      selectedItems.filter((d) => d !== selectedItem)
                    );
                  }}
                >
                  &#10005;
                </span>
              )}
            </Box>
          ))}
        </Box>
        <Box {...getComboboxProps()} className={classes.combobox}>
          <Input
            size="small"
            {...getInputProps(
              getDropdownProps({
                preventKeyAction: isOpen,
                onClick: () => {
                  openMenu();
                },
              })
            )}
            fullWidth
            className={classes.input}
          />
        </Box>
        <IconButton
          aria-label={"toggle menu"}
          size="small"
          {...getToggleButtonProps()}
          className={classes.toggleButton}
        >
          {isOpen ? <Icon name="chevronup" /> : <Icon name="chevrondown" />}
        </IconButton>
      </Flex>
      <Box
        component="ul"
        style={{ display: isOpen ? "block" : "none" }}
        {...getMenuProps()}
        className={classes.list}
      >
        {isOpen && isLoading ? (
          <Typography
            component="li"
            variant="body2"
            sx={{
              color: "secondary.main",
              p: 3,
              m: 0,
            }}
          >
            {t({ id: "combobox.isloading", message: `Resultate laden …` })}
          </Typography>
        ) : isOpen && !isLoading && getFilteredItems(items).length === 0 ? (
          <Typography
            component="li"
            variant="body2"
            sx={{
              color: "secondary.main",
              p: 3,
              m: 0,
            }}
          >
            {inputValue === "" && lazy ? (
              <>
                {t({
                  id: "combobox.prompt",
                  message: `Bezeichnung eingeben …`,
                })}
              </>
            ) : (
              <>{t({ id: "combobox.noitems", message: `Keine Einträge` })}</>
            )}
          </Typography>
        ) : isOpen && !isLoading ? (
          getFilteredItems(items).map((item, index) => (
            <Box
              component="li"
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
              className={cx(
                classes.filteredItem,
                index === highlightedIndex ? classes.filteredItemActive : null
              )}
            >
              {getItemLabel(item)}
            </Box>
          ))
        ) : null}
      </Box>
    </Box>
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

  const { classes, cx } = useComboboxStyles();

  return (
    <Box sx={{ position: "relative" }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
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
      </Flex>
      <Flex className={classes.inputContainer}>
        <Box {...getComboboxProps()} sx={{ flexGrow: 1, minWidth: 80 }}>
          <Input
            {...getInputProps({
              onFocus: (e) => {
                e.currentTarget.select();
              },
              onClick: () => {
                openMenu();
              },
            })}
            className={classes.input}
          />
        </Box>
        <IconButton
          size="small"
          aria-label={"toggle menu"}
          {...getToggleButtonProps()}
          className={classes.toggleMenu}
        >
          {isOpen ? <Icon name="chevronup" /> : <Icon name="chevrondown" />}
        </IconButton>
      </Flex>

      <Box
        component="ul"
        style={{ display: isOpen ? "block" : "none", overflow: "hidden" }}
        {...getMenuProps()}
        className={classes.list}
      >
        {isOpen &&
          inputItems.map((item, index) =>
            typeof item === "string" ? (
              <Box
                component="li"
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
                className={cx(
                  classes.listItem,
                  highlightedIndex === index && classes.listItemActive
                )}
              >
                {getItemLabel(item)}
              </Box>
            ) : (
              <Box
                component="li"
                className={cx(
                  classes.listItem2,
                  highlightedIndex === index && classes.listItemActive
                )}
              >
                {item.title}
              </Box>
            )
          )}
        {isOpen && inputItems.length === 0 && (
          <Box
            component="li"
            sx={{
              color: "secondary",
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
