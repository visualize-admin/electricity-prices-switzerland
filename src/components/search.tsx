import { Label } from "./form";
import { Box, Button, Flex, Input, Text } from "theme-ui";
import { Trans } from "@lingui/macro";
import { rollup } from "d3-array";
import { useMemo, useState, ReactNode } from "react";
import { useProvidersQuery } from "../graphql/queries";
import { useLocale } from "../lib/use-locale";
import { useCombobox } from "downshift";
import { Icon } from "../icons";
import { LocalizedLink } from "./links";
import { useRouter } from "next/router";

export const Search = () => {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState<string>("");
  const [gqlQuery] = useProvidersQuery({
    variables: {
      locale,
      query: inputValue,
    },
    pause: inputValue === "",
  });

  const items = gqlQuery.data?.cubeByIri?.providers ?? [];

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);

  return (
    <SearchField
      id="global-search"
      label={
        <Trans id="search.global">
          Siehe die detaillierte Preisanalyse von Kantone, Gemeinde,
          Netzbetreiber.
        </Trans>
      }
      items={items.map(({ id }) => id)}
      getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
      onInputValueChange={setInputValue}
      isLoading={gqlQuery.fetching && inputValue.length > 0}
      // lazy
    />
  );
};

export type SearchFieldProps = {
  label: string | ReactNode;
  id: string;
  items: string[];
  getItemLabel: (item: string) => string;
  onInputValueChange: (inputValue: string) => void;
  isLoading: boolean;
  // lazy: boolean;
};

export const SearchField = ({
  label,
  id,
  items,
  getItemLabel,
  onInputValueChange,
  isLoading,
}: // lazy,
SearchFieldProps) => {
  const { query } = useRouter();

  const [inputValue, setInputValue] = useState("");

  const inputItems = items;

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
    items,
    onStateChange: (changes: $FixMe) => {
      switch (changes.type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(changes.inputValue);
          onInputValueChange(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          // if (changes.selectedItem) {
          //   setInputValue(getItemLabel(changes.inputValue));
          //   setSelectedItem(changes.inputValue);
          // }
          break;
        case useCombobox.stateChangeTypes.InputBlur:
          setInputValue("");
          onInputValueChange("");
          break;
        default:
          break;
      }
    },
  });

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: "44rem", mx: 4 }}>
      <Label showLabel label={label} {...getLabelProps()}></Label>
      <Flex
        sx={{
          display: "block",

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
            <Trans id="combobox.isloading">Resultate laden …</Trans>
          </Text>
        ) : isOpen && !isLoading && inputItems.length === 0 ? (
          <Text
            as="li"
            variant="paragraph2"
            sx={{
              color: "secondary",
              p: 3,
              m: 0,
            }}
          >
            {inputValue === "" ? (
              // && lazy
              <Trans id="combobox.prompt">Bezeichnung eingeben …</Trans>
            ) : (
              <Trans id="combobox.noitems">Keine Einträge</Trans>
            )}
          </Text>
        ) : (
          <>
            {inputItems.map((item, index) => (
              <LocalizedLink
                key={`${item}${index}`}
                pathname="/[locale]/provider/[id]"
                query={{ ...query, id: item }}
                passHref
              >
                <Flex
                  {...getItemProps({ item, index })}
                  as="a"
                  sx={{
                    mx: 4,
                    py: 1,
                    px: 4,
                    alignItems: "center",
                    height: "3.5rem",
                    lineHeight: 1,
                    color: "text",
                    textDecoration: "none",
                    ":hover": {
                      cursor: "pointer",
                      bg: "mutedDarker",
                    },
                    ":focus": {
                      outline: 0,
                      bg: "primaryLight",
                    },
                  }}
                >
                  <Text variant="paragraph1" sx={{ flexGrow: 1 }}>
                    {getItemLabel(item)}
                  </Text>

                  <Box sx={{ width: "24px", flexShrink: 0 }}>
                    <Icon name="chevronright"></Icon>
                  </Box>
                </Flex>
              </LocalizedLink>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};
