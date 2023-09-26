import { t } from "@lingui/macro";

// import { i18n } from "@lingui/core";
import { useCombobox, useMultipleSelection } from "downshift";
import { useState, useEffect } from "react";
import { Box, Button, Flex, Input, Text } from "theme-ui";

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
  return (
    <Box sx={{ position: "relative" }}>
      <Label label={label} smaller {...getLabelProps()}></Label>
      <Flex
        sx={{
          display: "block",
          width: "100%",
          minHeight: 48,
          py: 0,
          pl: 2,
          pr: 6,
          alignItems: "center",
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
                ":focus": {
                  outline: 0,
                  bg: "primary",
                  color: "monochrome100",
                },
              }}
              key={`selected-item-${index}`}
              {...getSelectedItemProps({
                selectedItem,
                index,
                onKeyDown: (e) => {
                  // Prevent default, otherwise Firefox navigates back when Delete is pressed
                  e.preventDefault();
                },
              })}
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
        <Box
          {...getComboboxProps()}
          sx={{
            flexGrow: 1,
            minWidth: 30,
            flexBasis: 0,
            alignSelf: "center",
            my: 2,
          }}
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
        {isOpen && isLoading ? (
          <Text
            as="li"
            variant="paragraph2"
            sx={{
              color: "secondary",
              p: 3,
              m: 0,
            }}
          >
            {t({ id: "combobox.isloading", message: `Resultate laden …` })}
          </Text>
        ) : isOpen && !isLoading && getFilteredItems(items).length === 0 ? (
          <Text
            as="li"
            variant="paragraph2"
            sx={{
              color: "secondary",
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
          </Text>
        ) : isOpen && !isLoading ? (
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
        style={{ display: isOpen ? "block" : "none", overflow: "hidden" }}
        {...getMenuProps()}
      >
        {isOpen &&
          inputItems.map((item, index) =>
            typeof item === "string" ? (
              <Box
                as="li"
                sx={{
                  color: highlightedIndex === index ? "primaryActive" : "text",
                  bg:
                    highlightedIndex === index ? "primaryLight" : "transparent",
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
                as="li"
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
            as="li"
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
