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
import { rollup, group } from "d3-array";
import { useMemo, useState, ReactNode, useRef } from "react";
import { useSearchQuery, useProvidersQuery } from "../graphql/queries";
import { useLocale } from "../lib/use-locale";
import { useCombobox } from "downshift";
import { Icon } from "../icons";
import { LocalizedLink, createDynamicRouteProps } from "./links";
import { useRouter } from "next/router";
import { useTheme } from "../themes";

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

  return (
    <>
      <SearchField
        items={items.map(({ id, __typename }) => ({
          id,
          __typename,
        }))}
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

        // lazy
      />
    </>
  );
};

// export type SearchFieldProps = {
//   label: string | ReactNode;
//   id: string;
//   items: string[];
//   getItemLabel: (item: string) => string;
//   onInputValueChange: (inputValue: string) => void;
//   isLoading: boolean;
//   // lazy: boolean;
//   showLabel: boolean;
// };
type Item = { id: string; __typename: "Provider" | "Municipality" | "Canton" };
export const SearchField = ({
  label,
  items,
  setSearchString,
  getItemLabel,
  isLoading,
}: {
  items: Item[];
  setSearchString: (searchString: string) => void;
  getItemLabel: (item: string) => string;
  label: string | ReactNode;
  isLoading: boolean;
}) => {
  const theme = useTheme();
  const inputEl = useRef(null);
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
      // const { href, as } = createDynamicRouteProps({
      //   pathname,
      //   query,
      // });
      switch (changes.type) {
        case useCombobox.stateChangeTypes.ToggleButtonClick:
          inputEl.current.focus();
          break;
        case useCombobox.stateChangeTypes.InputChange:
          console.log("input value change", changes.inputValue);
          setInputValue(changes.inputValue);
          setSearchString(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          console.log("click");
          // push(href, as);
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

      <div {...getComboboxProps()} style={{ position: "relative" }}>
        {/* BUTTON */}
        <Flex
          as="button"
          type="button"
          {...getToggleButtonProps()}
          aria-label={"toggle menu"} // FIXME: localize
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

            "&:hover": {
              borderColor: "primary",
            },
          }}
        >
          <Icon
            name="search"
            size={24}
            color={theme.colors.monochrome700}
          ></Icon>
          <Text
            variant="heading3"
            sx={{
              fontWeight: "regular",
              ml: 4,
              width: "auto",
              flexShrink: 0,
              color: "monochrome800",
            }}
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

        {isOpen && (
          <>
            {/* INPUT */}
            <Flex
              sx={{
                position: ["fixed", "fixed", "absolute"],
                top: 0,
                left: 0,
                zIndex: 20,

                py: 0,
                pl: 4,
                pr: 4,

                justifyContent: "flex-start",
                alignItems: "center",

                width: ["100vw", "100vw", "100%"],
                height: 48,

                bg: "monochrome100",

                border: ["none", "none", "1px solid"],
                borderColor: ["none", "none", "primary"],
                borderBottom: "1px solid",
                borderBottomColor: "monochrome500",
                borderRadius: [0, 0, "default"],

                // visibility: isOpen ? "visible" : "hidden",
              }}
            >
              {/* Mobile back button */}
              <Button
                {...getToggleButtonProps()} // reuse of toggleButtonProps to close input field.
                variant="reset"
                type="button"
                sx={{
                  p: 0,
                  cursor: "pointer",
                  color: "primary",
                  display: ["block", "block", "none"],
                }}
              >
                <Icon name="chevronleft" size={24}></Icon>
              </Button>

              {/* Desktop Magnifying Glass icon */}
              <Box as="span" sx={{ display: ["none", "none", "block"] }}>
                <Icon
                  name="search"
                  size={24}
                  color={theme.colors.monochrome700}
                ></Icon>
              </Box>

              {/* Actual Input Field */}
              <Input
                {...getInputProps({ ref: inputEl, value: inputValue })}
                sx={{
                  height: "100%",
                  flexGrow: 1,
                  border: "none",
                  "&:focus": { outline: "none" },
                }}
              />
              {/* clear input */}
              <Button
                variant="reset"
                sx={{ cursor: "pointer" }}
                onClick={() => setInputValue("")}
              >
                <Icon
                  name="clear"
                  size={24}
                  color={theme.colors.monochrome700}
                ></Icon>
              </Button>
            </Flex>

            {/* MENU */}
            <Flex
              {...getMenuProps()}
              sx={{
                position: ["fixed", "fixed", "absolute"],
                top: [48, 48, 54],
                left: 0,
                zIndex: 21,

                width: ["100vw", "100vw", "100%"],
                height: ["calc(100vh - 48px)", "calc(100vh - 48px)", "auto"],

                bg: "monochrome100",
                p: 4,
                flexDirection: "column",

                visibility: isOpen ? "visible" : "hidden",

                boxShadow: ["none", "none", "tooltip"],
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
                  {[...group(items, (d) => d.__typename)].map(
                    ([entity, items]) => {
                      return (
                        <>
                          <Box
                            sx={{
                              color: "monochrome600",
                              fontSize: 3,
                              borderBottom: "1px solid",
                              borderBottomColor: "monochrome300",
                              px: 3,
                              py: 2,
                            }}
                          >
                            {entity}
                          </Box>
                          {items.map((item, index) => {
                            return (
                              <Box
                                key={`${item}${index}`}
                                {...getItemProps({
                                  item: item.id,
                                  index,
                                  onKeyDown: (event) => {
                                    if (event.key === "Enter") {
                                      // @ts-ignore
                                      event.nativeEvent.preventDownshiftDefault = true;
                                      // const { href, as } = createDynamicRouteProps({
                                      //   pathname: "/[locale]/provider/[id]",
                                      //   query: { ...query, id: item.id },
                                      // });
                                      // push(href, as);
                                    }
                                  },
                                })}
                              >
                                <LocalizedLink
                                  pathname="/[locale]/provider/[id]"
                                  query={{ ...query, id: item.id }}
                                  passHref
                                >
                                  <TUILink
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      backgroundColor:
                                        highlightedIndex === index
                                          ? "mutedDarker"
                                          : "inherit",
                                      color: "monochrome800",
                                      fontSize: [4],
                                      lineHeight: 1.2,
                                      textDecoration: "none",
                                      px: 3,
                                      py: 3,
                                    }}
                                  >
                                    {getItemLabel(item.id)}
                                  </TUILink>
                                </LocalizedLink>
                              </Box>
                            );
                          })}
                        </>
                      );
                    }
                  )}
                </>
              )}
            </Flex>
          </>
        )}
      </div>
    </Box>
  );
};
