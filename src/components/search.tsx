import { Label } from "./form";
import { Box, Button, Flex, Input, Text, Link as TUILink } from "theme-ui";
import { Trans } from "@lingui/macro";
import { rollup, group } from "d3-array";
import { useMemo, useState, ReactNode, useRef, Fragment } from "react";
import { useSearchQuery } from "../graphql/queries";
import { useLocale } from "../lib/use-locale";
import { useCombobox } from "downshift";
import { Icon } from "../icons";
import { LocalizedLink, createDynamicRouteProps } from "./links";
import { useRouter } from "next/router";
import { useTheme } from "../themes";
import { getLocalizedLabel } from "../domain/translation";
import { useI18n } from "./i18n-context";
import VisuallyHidden from "@reach/visually-hidden";

export const Search = () => {
  const locale = useLocale();
  const [searchString, setSearchString] = useState<string>("");

  const [gqlQuery] = useSearchQuery({
    variables: {
      locale,
      query: searchString,
    },
    pause: searchString === "",
  });

  // FIXME: use search results, not operators
  const items = gqlQuery.data?.search ?? [];

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
type ResultType = "OperatorResult" | "MunicipalityResult" | "CantonResult";
type Item = {
  id: string;
  __typename: ResultType;
};
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
  const i18n = useI18n();

  const inputEl = useRef<HTMLInputElement>(null);
  const { query, pathname, push } = useRouter();
  const [inputValue, setInputValue] = useState("");

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    closeMenu,
  } = useCombobox({
    id: `search-global`,
    items,
    onStateChange: (changes: $FixMe) => {
      switch (changes.type) {
        case useCombobox.stateChangeTypes.ToggleButtonClick:
          if (null !== inputEl.current) {
            inputEl.current.focus();
          }
          break;
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(changes.inputValue);
          setSearchString(changes.inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
          const { selectedItem } = changes;
          if (selectedItem) {
            const ent = getEntity(selectedItem.__typename);

            const { href, as } = createDynamicRouteProps({
              pathname: `/[locale]/${ent}/[id]`,
              query: { ...query, id: selectedItem.id },
            });

            push(href, as);
          }
          break;
        // case useCombobox.stateChangeTypes.ItemClick:
        //   console.log("click");
        //   push(href, as);
        //   break;
        case useCombobox.stateChangeTypes.InputBlur:
          setInputValue("");
          break;
        default:
          return changes;
      }
    },
  });

  return (
    <Box sx={{ width: "100%", maxWidth: "44rem", mx: "auto" }}>
      <VisuallyHidden>
        <label {...getLabelProps()}>{label}</label>
      </VisuallyHidden>
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
            <Trans id="search.global.hint.canton.muni.operator">
              Gemeinde, Netzbetreiber, Kanton
            </Trans>
          </Text>
        </Flex>

        {/* INPUT */}
        <Flex
          data-id="input"
          style={{ display: isOpen ? undefined : "none" }}
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
            borderRadius: [0, 0, "default"],

            border: ["0px solid", "0px solid", "1px solid"],
            borderColor: ["monochrome500", "monochrome500", "primary"],
            borderBottom: ["1px solid", "1px solid", "1px solid"],
            borderBottomColor: ["monochrome500", "monochrome500", "primary"],
          }}
        >
          {/* Mobile back button */}
          <Button
            onClick={() => closeMenu()}
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
              {[
                ...group(
                  // Create ad hoc index for items list
                  items.map((item, i) => ({ listId: i, ...item })),
                  (d) => d.__typename
                ),
              ].map(([entity, items], entityIndex) => {
                return (
                  <Fragment key={entityIndex}>
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
                      {getLocalizedLabel({ i18n, id: entity })}
                    </Box>
                    {items.map((item, index) => {
                      const ent = getEntity(entity);
                      return (
                        <LocalizedLink
                          key={`${item}${entity}${index}`}
                          pathname={`/[locale]/${ent}/[id]`}
                          query={{ ...query, id: item.id }}
                          passHref
                        >
                          <TUILink
                            {...getItemProps({
                              item: item,
                              index: item.listId,
                            })}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor:
                                highlightedIndex === item.listId
                                  ? "mutedDarker"
                                  : "inherit",
                              color: "monochrome800",
                              fontSize: [4],
                              lineHeight: 1.2,
                              textDecoration: "none",
                              px: 3,
                              py: 3,
                              "> svg": {
                                visibility: "hidden",
                              },

                              "&:hover > svg": {
                                visibility: "visible",
                              },
                            }}
                          >
                            {getItemLabel(item.id)}
                            <Icon name="chevronright"></Icon>
                          </TUILink>
                        </LocalizedLink>
                      );
                    })}
                  </Fragment>
                );
              })}
            </>
          )}
        </Flex>
      </div>
    </Box>
  );
};

const getEntity = (e: ResultType) => {
  switch (e) {
    case "OperatorResult":
      return "operator";
    case "MunicipalityResult":
      return "municipality";
    case "CantonResult":
      return "canton";
    default:
      "operator";
  }
};
