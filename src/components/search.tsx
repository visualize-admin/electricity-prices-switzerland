import { ParsedUrlQuery } from "querystring";

import { Trans } from "@lingui/macro";
import {
  Box,
  IconButton,
  Input,
  InputAdornment,
  Link,
  Typography,
} from "@mui/material";
import VisuallyHidden from "@reach/visually-hidden";
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

import Flex from "src/components/flex";
import { useSearchQuery } from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";
import { makeStyles } from "src/themes/makeStyles";

import { analyticsSiteSearch } from "../domain/analytics";
import { getLocalizedLabel } from "../domain/translation";
import { Icon } from "../icons";
import { useTheme } from "../themes";

const useStyles = makeStyles()((theme) => ({
  combobox: {
    maxWidth: "100%",
  },
  comboboxButton: {
    padding: theme.spacing(0),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    height: 48,
    overflow: "hidden",
    minWidth: 0,

    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",

    appearance: "none",

    border: "1px solid",
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    borderColor: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[100],
    cursor: "pointer",
    maxWidth: "100%",

    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  },
  comboboxButtonOpen: {
    border: "1px solid",
    borderColor: theme.palette.primary.main,
  },

  placeholder1: {
    fontWeight: "normal",
    marginLeft: theme.spacing(4),
    flexShrink: 0,
    color: theme.palette.grey[800],
  },

  placeholder2: {
    fontWeight: "normal",
    marginLeft: theme.spacing(4),
    color: theme.palette.grey[500],
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    flexShrink: 1,
    minWidth: 0,
    overflow: "hidden",
  },

  input: {
    top: 0,
    left: 0,
    zIndex: 20,

    padding: theme.spacing(0, 2),

    justifyContent: "flex-start",
    alignItems: "center",

    height: 48,

    backgroundColor: theme.palette.grey[100],

    width: "100vw",
    position: "fixed",
    border: "0px solid",
    borderRadius: 0,
    borderColor: theme.palette.grey[500],
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.grey[500],

    [theme.breakpoints.up("sm")]: {
      position: "absolute",
      borderRadius: theme.shape.borderRadius,
      top: 0,
      width: "100%",
      border: "1px solid",
      borderColor: theme.palette.grey[500],
      borderBottom: "1px solid",
      borderBottomColor: theme.palette.grey[500],
    },
  },

  searchIconDesktop: {
    display: "none",
    padding: 0,
    margin: 0,
    marginRight: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
  },

  actualInput: {
    minHeight: "100%",
    flexGrow: 1,
    px: 0,
    border: "none",
    "&.Mui-focused, &:focus": {
      outline: "none",
    },
  },

  menu: {
    position: "fixed",
    top: 48,

    left: 0,
    zIndex: 21,
    overflowY: "auto",
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(4),
    flexDirection: "column",
    visibility: "hidden",

    width: "100vw",
    height: "calc(100vh - 48px)",
    maxHeight: "100vh",
    boxShadow: "none",

    [theme.breakpoints.up("sm")]: {
      position: "absolute",
      top: 54,
      width: "100%",
      height: "auto",
      maxHeight: "50vh",
      boxShadow: theme.shadows[6],
    },
  },

  menuOpened: {
    visibility: "visible",
  },

  label: {
    color: theme.palette.grey[600],
    fontSize: "0.875rem",
    borderBottom: "1px solid",
    borderBottomColor: "grey.300",
    padding: theme.spacing(2, 3),
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "inherit",
    color: theme.palette.grey[800],
    fontSize: "1rem",
    lineHeight: 1.2,
    textDecoration: "none",
    padding: theme.spacing(3),

    "> svg": {
      visibility: "hidden",
    },

    "&:hover > svg": {
      visibility: "visible",
    },
  },

  highlightedItem: {
    backgroundColor: theme.palette.muted.dark,
  },
}));

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

  const { query, push } = useRouter();

  return (
    <>
      <SearchField
        items={items.map(({ id, __typename }) => ({
          id,
          __typename,
        }))}
        getItemLabel={(id) => itemById.get(id)?.name ?? `[${id}]`}
        setSearchString={setSearchString}
        onSelectItem={push}
        query={query}
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
  onSelectItem,
  query,
}: {
  items: Item[];
  setSearchString: (searchString: string) => void;
  getItemLabel: (item: string) => string;
  label: string | ReactNode;
  isLoading: boolean;
  onSelectItem: ({ pathname }: { pathname: string }) => void;
  query: ParsedUrlQuery;
}) => {
  const theme = useTheme();

  const inputEl = useRef<HTMLInputElement>(null);
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

            onSelectItem(href);
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

  const { classes, cx } = useStyles();

  return (
    <Box sx={{ overflow: "hidden", maxWidth: "100%" }}>
      <VisuallyHidden>
        <label {...getLabelProps()}>{label}</label>
      </VisuallyHidden>
      <div className={classes.combobox} {...getComboboxProps()}>
        {/* BUTTON */}
        <Flex
          component="button"
          type="button"
          {...getToggleButtonProps()}
          aria-label={"toggle menu"} // FIXME: localize
          className={cx(
            classes.comboboxButton,
            isOpen ? classes.comboboxButtonOpen : null
          )}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Icon
              name="search"
              size={24}
              color={theme.palette.grey[700]}
            ></Icon>
          </Box>
          <Typography variant="h3" className={classes.placeholder1}>
            <Trans id="search.global.hint.go.to">Gehe zu…</Trans>
          </Typography>
          <Typography variant="h3" className={classes.placeholder2}>
            Gemeindename, PLZ, Netzbetreiber, Kanton
          </Typography>
        </Flex>

        {/* INPUT */}
        <Flex
          data-id="input"
          style={{
            /* Always render input element, so .focus() works on iOS Safari too (it won't if element has display: none) */
            top: isOpen ? undefined : "-10000px",
          }}
          className={classes.input}
        >
          {/* Mobile back button */}
          <IconButton
            onClick={() => closeMenu()}
            type="button"
            sx={{
              color: "primary.main",
              display: ["span", "span", "none"],
            }}
          >
            <Icon name="chevronleft" size={24}></Icon>
          </IconButton>

          {/* Actual Input Field */}
          <Input
            inputProps={getInputProps({ ref: inputEl, value: inputValue })}
            startAdornment={
              <InputAdornment
                position="start"
                className={classes.searchIconDesktop}
              >
                <Icon name="search" size={24} color={theme.palette.grey[700]} />
              </InputAdornment>
            }
            /* clear input */
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setInputValue("");
                    inputEl.current?.focus();
                  }}
                >
                  <Icon
                    name="clear"
                    size={24}
                    color={theme.palette.grey[700]}
                  />
                </IconButton>
              </InputAdornment>
            }
            className={classes.actualInput}
          />
        </Flex>

        {/* MENU */}
        <Flex
          {...getMenuProps()}
          className={cx(classes.menu, isOpen && classes.menuOpened)}
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
                    <Box className={classes.label}>
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
                          <Link
                            {...getItemProps({
                              item: item,
                              index: item.listId,
                            })}
                            underline="none"
                            data-testid={`search-option-${entity}-${item.id}`}
                            className={cx(
                              classes.listItem,
                              highlightedIndex === item.listId
                                ? classes.highlightedItem
                                : null
                            )}
                          >
                            {getItemLabel(item.id)}
                            <Icon name="chevronright" />
                          </Link>
                        </NextLink>
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
