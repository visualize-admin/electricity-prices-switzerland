import { Trans, select } from "@lingui/macro";
import { useCombobox, useMultipleSelection, UseComboboxState } from "downshift";
import { useState, ReactNode } from "react";
import { Box, Button, Flex, Input } from "theme-ui";
import { Icon } from "../icons";
import { Label } from "./form";
import { getLocalizedLabel } from "../domain/translation";

type Props = {
  label: React.ReactNode;
  items: string[];
};

export const ComboboxMulti = ({ label, items }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: [items[0], items[1]] });

  const getFilteredItems = (_items: string[]) =>
    _items.filter(
      (item) =>
        selectedItems.indexOf(item) < 0 &&
        item.toLowerCase().startsWith(inputValue.toLowerCase())
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
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            setInputValue("");
            addSelectedItem(selectedItem);
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
  return (
    <Box sx={{ position: "relative" }}>
      <label {...getLabelProps()}></label>
      <Flex
        sx={{
          display: "block",
          width: "100%",
          py: 0,
          pl: 2,
          pr: 6,

          appearance: "none",
          fontSize: "inherit",
          lineHeight: "inherit",
          border: "1px solid",
          borderRadius: 4,
          color: "text",
          borderColor: isOpen ? "primary" : "monochrome500",
          bg: "monochrome100",
          flexWrap: "wrap",
          ":focus-within": { borderColor: "primary" },
          position: "relative",
        }}
      >
        <Box sx={{ mt: 2 }}>
          {selectedItems.map((selectedItem, index) => (
            <Box
              sx={{
                display: "inline-block",
                p: 1,
                mr: 2,
                mb: 2,
                borderRadius: "default",
                fontSize: 2,
                bg: "primaryLight",
              }}
              key={`selected-item-${index}`}
              {...getSelectedItemProps({ selectedItem, index })}
            >
              {selectedItem}{" "}
              <span
                style={{}}
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItem);
                }}
              >
                &#10005;
              </span>
            </Box>
          ))}
        </Box>
        <Box
          {...getComboboxProps()}
          sx={{ flexGrow: 1, minWidth: 80, alignSelf: "center", my: 2 }}
        >
          <Input
            {...getInputProps(
              getDropdownProps({
                preventKeyAction: isOpen,
                onClick: () => {
                  openMenu();
                },
              })
            )}
            sx={{
              display: "block",
              // width: "100%",
              appearance: "none",
              fontSize: "inherit",
              lineHeight: "inherit",
              border: "none",
              color: "text",
              bg: "transparent",
              borderRadius: 0,
              p: 0,
              ":focus": { outline: 0 },
            }}
          />
        </Box>
        <Button
          {...getToggleButtonProps()}
          aria-label={"toggle menu"}
          variant="reset"
          sx={{
            color: "monochrome800",
            p: 0,
            mr: 1,
            position: "absolute",
            right: 0,
            top: "50%",
            height: 24,
            transform: "translateY(-50%)",
          }}
        >
          {isOpen ? <Icon name="chevronup" /> : <Icon name="chevrondown" />}
        </Button>
      </Flex>
      <Box
        as="ul"
        sx={{
          listStyle: "none",
          borderRadius: "default",
          boxShadow: "tooltip",
          bg: "monochrome100",
          mt: 1,
          p: 0,
          position: "absolute",
          width: "100%",
          zIndex: 999,
        }}
        style={{ display: isOpen ? "block" : "none" }}
        {...getMenuProps()}
      >
        {isOpen &&
          getFilteredItems(items).map((item, index) => (
            <Box
              as="li"
              sx={{
                color: highlightedIndex === index ? "primaryActive" : "text",
                bg: highlightedIndex === index ? "primaryLight" : "transparent",
                p: 3,
                m: 0,
              }}
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </Box>
          ))}
        {isOpen && getFilteredItems(items).length === 0 && (
          <Box
            as="li"
            sx={{
              color: "secondary",
              p: 3,
              m: 0,
            }}
          >
            <Trans id="combobox.noitems">No items</Trans>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const Combobox = ({
  label,
  items,
  selectedItem,
  handleSelectedItemChange,
}: {
  label: string | ReactNode;
  items: string[];
  selectedItem: string;
  handleSelectedItemChange: (changes: { selectedItem: string }) => void;
}) => {
  const [inputValue, setInputValue] = useState(selectedItem);

  const getFilteredItems = () => {
    return inputValue && inputValue !== selectedItem
      ? items.filter((item) =>
          item.toLowerCase().startsWith(inputValue.toLowerCase())
        )
      : items;
  };

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
    inputValue,
    selectedItem,
    items: inputItems,
    onStateChange: (changes: $FixMe) => {
      console.log(changes);
      switch (changes.type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(changes.inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (changes.selectedItem) {
            setInputValue(changes.inputValue);
            handleSelectedItemChange({ selectedItem: changes.inputValue });
          }
          break;
        case useCombobox.stateChangeTypes.InputBlur:
          setInputValue(selectedItem);
          break;
        default:
          break;
      }
    },
  });

  return (
    <Box sx={{ position: "relative" }}>
      <Label label={label} smaller {...getLabelProps()}></Label>
      <Flex
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
          borderRadius: 4,
          color: "text",
          borderColor: isOpen ? "primary" : "monochrome500",
          bg: "monochrome100",
          flexWrap: "wrap",
          ":focus-within": { borderColor: "primary" },
          position: "relative",
        }}
      >
        <Box
          {...getComboboxProps()}
          sx={{ flexGrow: 1, minWidth: 80, alignSelf: "center", my: 2 }}
        >
          <Input
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
              bg: "transparent",
              borderRadius: 0,
              p: 0,
              ":focus": { outline: 0 },
            }}
          />
        </Box>
        <Button
          {...getToggleButtonProps()}
          aria-label={"toggle menu"}
          variant="reset"
          sx={{
            color: "monochrome800",
            p: 0,
            mr: 1,
            position: "absolute",
            right: 0,
            top: "50%",
            height: 48,
            transform: "translateY(-50%)",
          }}
        >
          {isOpen ? <Icon name="chevronup" /> : <Icon name="chevrondown" />}
        </Button>
      </Flex>

      <Box
        as="ul"
        sx={{
          listStyle: "none",
          borderRadius: "default",
          boxShadow: "tooltip",
          bg: "monochrome100",
          mt: 1,
          p: 0,
          position: "absolute",
          width: "100%",
          zIndex: 999,
        }}
        style={{ display: isOpen ? "block" : "none" }}
        {...getMenuProps()}
      >
        {isOpen &&
          inputItems.map((item, index) => (
            <Box
              as="li"
              sx={{
                color: highlightedIndex === index ? "primaryActive" : "text",
                bg: highlightedIndex === index ? "primaryLight" : "transparent",
                p: 3,
                m: 0,
              }}
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </Box>
          ))}
        {isOpen && inputItems.length === 0 && (
          <Box
            as="li"
            sx={{
              color: "secondary",
              p: 3,
              m: 0,
            }}
          >
            <Trans id="combobox.noitems">No items</Trans>
          </Box>
        )}
      </Box>
    </Box>
  );
};
