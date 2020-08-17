import { Label } from "./form";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Label as TUILabel,
  Link as TUILink,
} from "theme-ui";
import { Trans } from "@lingui/macro";
import { rollup } from "d3-array";
import { useMemo, useState, ReactNode } from "react";
import { useSearchQuery, useProvidersQuery } from "../graphql/queries";
import { useLocale } from "../lib/use-locale";
import { useCombobox } from "downshift";
import { Icon } from "../icons";
import { LocalizedLink, createDynamicRouteProps } from "./links";
import { useRouter } from "next/router";

export const Search = ({ showLabel = true }: { showLabel?: boolean }) => {
  const locale = useLocale();
  const [searchString, setSearchString] = useState<string>("");
  console.log({ searchString });

  const [gqlQuery] = useSearchQuery({
    variables: {
      locale,
      query: searchString,
    },
    pause: searchString === "",
  });

  // FIXME: use search results, not providers
  const items = gqlQuery.data?.providers ?? [];

  const itemById = useMemo(() => {
    return rollup(
      items,
      (values) => values[0],
      (d) => d.id
    );
  }, [items]);
  console.log("items", items);
  // const items = ["one", "two", "three"];
  return (
    <>
      <SF
        items={items.map(({ id }) => id)}
        getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
        setSearchString={setSearchString}
        label={
          <Trans id="search.global">
            Siehe die detaillierte Preisanalyse von Kantone, Gemeinde,
            Netzbetreiber.
          </Trans>
        }
        isLoading={gqlQuery.fetching && searchString.length > 0}
        // getItemLabel={(d) => d}
        // items={items}
      />
      {/* <SearchField
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
      showLabel={showLabel}
      // lazy
    />*/}
    </>
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
  showLabel: boolean;
};

export const SF = ({
  label,
  items,
  setSearchString,
  getItemLabel,
  isLoading,
}: {
  items: string[];
  setSearchString: (searchString: string) => void;
  getItemLabel: (item: string) => string;
  label: string | ReactNode;
  isLoading: boolean;
}) => {
  const { query, pathname, push } = useRouter();
  const [inputValue, setInputValue] = useState("");
  // const [inputItems, setInputItems] = useState(items);
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    id: `search-global`,
    items,
    onStateChange: (changes: $FixMe) => {
      const { href, as } = createDynamicRouteProps({
        pathname,
        query,
      });
      switch (changes.type) {
        case useCombobox.stateChangeTypes.InputChange:
          console.log("input value change", changes.inputValue);
          setInputValue(changes.inputValue);
          setSearchString(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          console.log("click");
          push(href, as);
          break;
        default:
          return changes;
      }
    },
  });

  return (
    <Box sx={{ width: "100%", maxWidth: "44rem" }}>
      <TUILabel {...getLabelProps()}>
        <Text
          variant="paragraph1"
          sx={{
            width: "100%",
            textAlign: ["left", "left", "center"],
            color: "monochrome800",
            mt: 2,
            mb: 2,
          }}
        >
          {label}
        </Text>
      </TUILabel>

      <div {...getComboboxProps()}>
        <Flex
          as="button"
          type="button"
          {...getToggleButtonProps()}
          aria-label={"toggle menu"}
          sx={{
            py: 0,
            pl: 4,
            pr: 6,
            height: 48,
            width: "100%",

            justifyContent: "flex-start",
            alignItems: "center",

            appearance: "none",

            border: "1px solid",
            borderRadius: "default",
            color: "text",
            borderColor: isOpen ? "primary" : "monochrome500",
            bg: "monochrome100",
          }}
        >
          <Icon name="search" size={32}></Icon>
          <Text
            variant="heading3"
            sx={{ fontWeight: "regular", ml: 4, width: "auto", flexShrink: 0 }}
          >
            <Trans id="search.global.hint.go.to">Gehe zu…</Trans>
          </Text>
          <Text
            variant="heading3"
            sx={{
              fontWeight: "regular",
              ml: 4,
              color: "monochrome500",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            <Trans id="search.global.hint.canton.muni.provider">
              Gemeinde, Netzbetreiber, Kanton
            </Trans>
          </Text>
        </Flex>

        <Flex
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 20,

            width: "100vw",
            height: 48,

            bg: "monochrome100",

            border: "none",
            borderBottom: "1px solid",
            borderBottomColor: "monochrome500",

            justifyContent: "flex-start",
            alignItems: "center",

            visibility: isOpen ? "visible" : "hidden",
          }}
        >
          <Button
            {...getToggleButtonProps()} // reuse of toggleButtonProps to close input field.
            variant="reset"
            sx={{ width: 48, height: 48, color: "primary" }}
          >
            <Icon name="chevronleft" size={24}></Icon>
          </Button>
          <Input
            {...getInputProps()}
            sx={{ height: "100%", flexGrow: 1, border: "none" }}
          />
        </Flex>
      </div>

      <Flex
        {...getMenuProps()}
        sx={{
          position: "fixed",
          top: 48,
          left: 0,
          zIndex: 21,

          width: "100vw",
          height: "calc(100vh - 48px)",

          bg: "monochrome100",
          p: 4,
          flexDirection: "column",

          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        {isOpen && inputValue === "" ? (
          <Text variant="paragraph1" sx={{ color: "monochrome800" }}>
            {label}
          </Text>
        ) : inputValue !== "" && isLoading ? (
          <Text variant="paragraph1" sx={{ color: "monochrome800" }}>
            <Trans id="combobox.isloading">Resultate laden …</Trans>
          </Text>
        ) : inputValue !== "" && !isLoading && items.length === 0 ? (
          <Text variant="paragraph1" sx={{ color: "monochrome800" }}>
            <Trans id="combobox.noitems">Keine Einträge</Trans>
          </Text>
        ) : (
          <>
            {items.map((item, index) => (
              <LocalizedLink
                pathname="/[locale]/provider/[id]"
                query={{ ...query, id: item }}
                passHref
                key={`${item}${index}`}
              >
                <TUILink
                  {...getItemProps({
                    item,
                    index,
                  })}
                  sx={{
                    height: 48,
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor:
                      highlightedIndex === index ? "mutedDarker" : "inherit",
                    color: "monochrome800",
                    fontSize: [3],
                    lineHeight: 1.2,
                    pl: 3,
                  }}
                >
                  {getItemLabel(item)}
                </TUILink>
              </LocalizedLink>
            ))}
          </>
        )}
      </Flex>
    </Box>
  );
};

export const SearchField = ({
  label,
  id,
  items,
  getItemLabel,
  onInputValueChange,
  isLoading,
  showLabel,
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
          if (changes.selectedItem) {
            setInputValue(getItemLabel(changes.inputValue));
            // setSelectedItem(changes.inputValue);
          }
          break;
        // case useCombobox.stateChangeTypes.InputBlur:
        // setInputValue("");
        // onInputValueChange("");
        // break;
        default:
          break;
      }
    },
  });

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: "44rem" }}>
      <TUILabel
        {...getLabelProps()}
        sx={{
          visibility: showLabel ? "visible" : "hidden",
          height: showLabel ? "2rem" : 0,
        }}
      >
        <Text
          variant="paragraph2"
          sx={{
            width: "100%",
            textAlign: "center",
            color: "monochrome800",
            mt: 2,
            mb: 2,
          }}
        >
          {label}
        </Text>
      </TUILabel>
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
              // <LocalizedLink
              //   key={`${item}${index}`}
              //   pathname="/[locale]/provider/[id]"
              //   query={{ ...query, id: item }}
              //   passHref
              // >
              <Flex
                {...getItemProps({ item, index })}
                key={`${item}${index}`}
                as="li"
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
              // </LocalizedLink>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};
