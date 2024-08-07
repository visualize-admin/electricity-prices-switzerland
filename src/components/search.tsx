import { Trans } from "@lingui/macro";
import { Box, Button, Input, Link as TUILink, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { group, rollup } from "d3-array";
import { useCombobox } from "downshift";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import VisuallyHidden from "src/components/VisuallyHidden";
import { useSearchQuery } from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

import { analyticsSiteSearch } from "../domain/analytics";
import { getLocalizedLabel } from "../domain/translation";
import { Icon } from "../icons";

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

  const items = gqlQuery.data?.search ?? EMPTY_ARRAY;

  useEffect(() => {
    const currentVariables = gqlQuery.operation?.variables as
      | {
          locale: string;
          query: string;
        }
      | undefined;

    // Make sure that we only track search when the actual query matches the search string.
    // If this is not checked, we get a false results because fetching is updated in a 2nd render pass.
    // Effectively, searches are only tracked _after_ the results have loaded
    if (
      currentVariables?.query === searchString &&
      !gqlQuery.fetching &&
      searchString !== ""
    ) {
      analyticsSiteSearch(searchString, items.length);
    }
  }, [gqlQuery, searchString, items]);

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
          <Trans id="search.global.label">
            Suche nach Gemeindename, PLZ, Netzbetreiber, Kanton
          </Trans>
        }
        isLoading={gqlQuery.fetching && searchString.length > 0}
      />
    </>
  );
};

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

  const inputEl = useRef<HTMLInputElement>(null);
  const { query, push } = useRouter();
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
          inputEl.current?.focus();
          break;
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(changes.inputValue);
          setSearchString(changes.inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
          const { selectedItem } = changes;
          if (selectedItem) {
            const ent = getEntity(selectedItem.__typename);

            const href = {
              pathname: `/${ent}/[id]`,
              query: { ...query, id: selectedItem.id },
            };

            push(href);
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
        <Box
          component="button"
          type="button"
          {...getToggleButtonProps()}
          // FIXME: localize
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
            borderRadius: 3,
            color: "text",
            borderColor: isOpen ? "primary" : "grey.500",
            bgcolor: "grey.100",

            "&:hover": {
              borderColor: "primary",
            },
          }}
          display="flex"
        >
          <Box sx={{ flexShrink: 0 }}>
            <Icon
              name="search"
              size={24}
              color={theme.palette.grey[700]}
            ></Icon>
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "regular",
              ml: 4,
              width: "auto",
              flexShrink: 0,
              color: "grey.800",
            }}
          >
            <Trans id="search.global.hint.go.to">Gehe zu…</Trans>
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "regular",
              ml: 4,
              color: "grey.500",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            <Trans id="search.global.hint.canton.muni.operator">
              Gemeindename, PLZ, Netzbetreiber, Kanton
            </Trans>
          </Typography>
        </Box>

        {/* INPUT */}
        <Box
          data-id="input"
          style={{
            /* Always render input element, so .focus() works on iOS Safari too (it won't if element has display: none) */
            top: isOpen ? undefined : "-10000px",
          }}
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

            bgcolor: "grey.100",
            borderRadius: [0, 0, "default"],

            border: ["0px solid", "0px solid", "1px solid"],
            borderColor: ["grey.500", "grey.500", "primary"],
            borderBottom: ["1px solid", "1px solid", "1px solid"],
            borderBottomColor: ["grey.500", "grey.500", "primary"],
          }}
          display="flex"
        >
          {/* Mobile back button */}
          <Button
            onClick={() => closeMenu()}
            variant="reset"
            type="button"
            sx={{
              p: 0,
              cursor: "pointer",
              color: "primary.main",
              display: ["block", "block", "none"],
            }}
          >
            <Icon name="chevronleft" size={24}></Icon>
          </Button>
          {/* Desktop Magnifying Glass icon */}
          <Box component="span" sx={{ display: ["none", "none", "block"] }}>
            <Icon
              name="search"
              size={24}
              color={theme.palette.grey[700]}
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
            onClick={() => {
              setInputValue("");
              inputEl.current?.focus();
            }}
          >
            <Icon name="clear" size={24} color={theme.palette.grey[700]}></Icon>
          </Button>
        </Box>

        {/* MENU */}
        <Box
          {...getMenuProps()}
          sx={{
            position: ["fixed", "fixed", "absolute"],
            top: [48, 48, 54],
            left: 0,
            zIndex: 21,

            width: ["100vw", "100vw", "100%"],
            height: ["calc(100vh - 48px)", "calc(100vh - 48px)", "auto"],
            maxHeight: ["100vh", "100vh", "50vh"],
            overflowY: "auto",

            bgcolor: "grey.100",
            p: 4,
            flexDirection: "column",

            visibility: isOpen ? "visible" : "hidden",

            boxShadow: ["none", "none", "tooltip"],
          }}
          display="flex"
        >
          {isOpen && inputValue === "" ? (
            <Typography variant="body1" sx={{ color: "grey.800" }}>
              {label}
            </Typography>
          ) : inputValue !== "" && isLoading ? (
            <Typography variant="body1" sx={{ color: "grey.800" }}>
              <Trans id="combobox.isloading">Resultate laden …</Trans>
            </Typography>
          ) : inputValue !== "" && !isLoading && items.length === 0 ? (
            <Typography variant="body1" sx={{ color: "grey.800" }}>
              <Trans id="combobox.noitems">Keine Einträge</Trans>
            </Typography>
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
                        color: "grey.600",
                        fontSize: "0.875rem",
                        borderBottom: "1px solid",
                        borderBottomColor: "grey.300",
                        px: 3,
                        py: 2,
                      }}
                    >
                      {getLocalizedLabel({ id: entity })}
                    </Box>
                    {items.map((item, index) => {
                      const ent = getEntity(entity);
                      return (
                        <NextLink
                          key={`${item}${entity}${index}`}
                          href={{
                            pathname: `/${ent}/[id]`,
                            query: { ...query, id: item.id },
                          }}
                          passHref
                        >
                          <TUILink
                            {...getItemProps({
                              item: item,
                              index: item.listId,
                            })}
                            data-testid={`search-option-${entity}-${item.id}`}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor:
                                highlightedIndex === item.listId
                                  ? "muted.darker"
                                  : "inherit",
                              color: "grey.800",
                              fontSize: ["1rem"],
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
                        </NextLink>
                      );
                    })}
                  </Fragment>
                );
              })}
            </>
          )}
        </Box>
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
