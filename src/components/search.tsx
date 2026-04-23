import { t, Trans } from "@lingui/macro";
import {
  Autocomplete,
  autocompleteClasses,
  AutocompleteProps,
  Box,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { rollup } from "d3";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import {
  AutocompleteGroupLabel,
  AutocompleteGroupUl,
} from "src/components/autocomplete";
import { VisuallyHidden } from "src/components/visually-hidden";
import { analyticsSiteSearch } from "src/domain/analytics";
import { getLocalizedLabel } from "src/domain/translation";
import { useSearchQuery } from "src/graphql/queries";
import { Icon } from "src/icons";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

type SearchProps = {
  variant?: "desktop" | "drawer";
  autoFocus?: boolean;
  onResultNavigate?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  bareDrawerField?: boolean;
};

export const Search = ({
  variant = "desktop",
  autoFocus = false,
  onResultNavigate,
  inputRef: inputRefProp,
  bareDrawerField = false,
}: SearchProps) => {
  const locale = useLocale();
  const [searchString, setSearchString] = useState<string>("");

  const [gqlQuery] = useSearchQuery({
    variables: {
      locale,
      query: searchString,
    },
    pause: searchString === "",
  });

  const items =
    searchString === "" ? EMPTY_ARRAY : gqlQuery.data?.search ?? EMPTY_ARRAY;

  useEffect(() => {
    const currentVariables = gqlQuery.operation?.variables as
      | {
          locale: string;
          query: string;
        }
      | undefined;

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

  const handleSelection = () => {
    onResultNavigate?.();
  };

  const isDrawer = variant === "drawer";

  return (
    <Box
      position="relative"
      py={
        isDrawer
          ? 0
          : {
              md: 4,
            }
      }
      width={isDrawer ? "100%" : undefined}
    >
      <Box width={isDrawer ? "100%" : "22rem"}>
        <SearchField
          items={items.map(({ id, __typename }) => ({
            id,
            __typename,
          }))}
          getItemLabel={(item) => itemById.get(item.id)?.name ?? `[${item.id}]`}
          setSearchString={setSearchString}
          label={
            <Trans id="search.global.label">
              Search by municipality name, zip code, network operator, canton
            </Trans>
          }
          isLoading={gqlQuery.fetching && searchString.length > 0}
          onSelection={handleSelection}
          isMobile={isDrawer}
          autoFocus={autoFocus}
          omitFieldSearchIcon={isDrawer}
          inputRefProp={inputRefProp}
          compactInputHeight={isDrawer}
          bareDrawerField={bareDrawerField && isDrawer}
        />
      </Box>
    </Box>
  );
};

type ResultType = "OperatorResult" | "MunicipalityResult" | "CantonResult";

type Item = {
  id: string;
  __typename: ResultType;
};

const SearchField = ({
  label,
  items,
  setSearchString,
  getItemLabel,
  isLoading,
  onSelection,
  isMobile,
  autoFocus,
  omitFieldSearchIcon,
  inputRefProp,
  compactInputHeight,
  bareDrawerField,
}: {
  items: Item[];
  setSearchString: (searchString: string) => void;
  getItemLabel: (item: Item) => string;
  label: string | ReactNode;
  isLoading: boolean;
  onSelection: () => void;
  isMobile: boolean;
  autoFocus?: boolean;
  omitFieldSearchIcon?: boolean;
  inputRefProp?: React.Ref<HTMLInputElement>;
  compactInputHeight?: boolean;
  bareDrawerField?: boolean;
}) => {
  const { query, push } = useRouter();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const setInputRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof inputRefProp === "function") {
      inputRefProp(el);
    } else if (inputRefProp) {
      (
        inputRefProp as React.MutableRefObject<HTMLInputElement | null>
      ).current = el;
    }
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  type SearchAutocompleteProps = AutocompleteProps<Item, false, false, false>;
  const handleInputChange: SearchAutocompleteProps["onInputChange"] = (
    event,
    value,
    reason
  ) => {
    if (!event || reason === "reset") {
      return;
    }
    setInputValue(value);
    setSearchString(value);
  };

  const handleOptionSelect: SearchAutocompleteProps["onChange"] = (
    _,
    value
  ) => {
    if (value) {
      const ent = getEntity(value.__typename);
      const href = {
        pathname: `/${ent}/[id]`,
        query: { ...query, id: value.id },
      };
      push(href);
      onSelection();
      setInputValue("");
      setSearchString("");
      inputRef.current?.blur();
    }
  };

  const groupedItems = useMemo(() => {
    return sortBy(items, (item) => item.__typename);
  }, [items]);

  const groupBy = (option: Item) => option.__typename;
  return (
    <Box width="100%">
      <VisuallyHidden>
        <label>{label}</label>
      </VisuallyHidden>
      <Autocomplete
        id={isMobile ? "search-global-mobile-drawer" : "search-global"}
        options={groupedItems}
        getOptionLabel={(item) => `${getItemLabel(item)}`}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleOptionSelect}
        noOptionsText={
          inputValue === ""
            ? t({
                id: "search.global.label",
                message:
                  "Search by municipality name, zip code, network operator, canton",
              })
            : t({ id: "combobox.noitems", message: "No results" })
        }
        loading={isLoading}
        popupIcon={null}
        size="small"
        sx={{
          width: "100%",
          // themes/components.tsx: MuiInputBase adds border-left on .MuiAutocomplete-endAdornment (loading).
          // We merge that slot back in for loading (see endAdornment); strip the divider on desktop + drawer.
          "& .MuiOutlinedInput-root .MuiAutocomplete-endAdornment": {
            borderLeft: "none !important",
            border: "none !important",
            marginLeft: "0 !important",
            paddingLeft: "0 !important",
            minHeight: "unset",
            height: "auto",
          },
          ...(bareDrawerField
            ? {
                // MUI default: sizeSmall .MuiAutocomplete-input { padding: 2.5px 4px 2.5px 8px }
                [`& .MuiOutlinedInput-root.MuiInputBase-sizeSmall .${autocompleteClasses.input}`]:
                  {
                    padding: "2.5px 4px 2.5px 0 !important",
                  },
              }
            : {}),
        }}
        groupBy={groupBy}
        renderGroup={(params) => (
          <li key={params.group}>
            <AutocompleteGroupLabel className={autocompleteClasses.groupLabel}>
              {getLocalizedLabel({
                id: params.group as ReturnType<typeof groupBy>,
              })}
            </AutocompleteGroupLabel>
            <AutocompleteGroupUl className={autocompleteClasses.groupUl}>
              {params.children}
            </AutocompleteGroupUl>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            inputRef={setInputRefs}
            sx={
              bareDrawerField
                ? {
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      padding: 0,
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                        borderWidth: 0,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                        borderWidth: 0,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                        borderWidth: 0,
                      },
                      "&.Mui-focused": { boxShadow: "none" },
                    },
                  }
                : undefined
            }
            InputProps={{
              ...params.InputProps,
              sx: {
                px: bareDrawerField ? "0px !important" : "16px !important",
                borderRadius: bareDrawerField ? 0 : 0.5,
                height: compactInputHeight ? 40 : 44,
                borderColor: bareDrawerField ? "transparent" : "monochrome.500",
                bgcolor: "transparent",
                ...(bareDrawerField
                  ? {
                      "& fieldset": { border: "none !important" },
                      "&:hover fieldset": { border: "none !important" },
                      "&.Mui-focused fieldset": { border: "none !important" },
                      "&.Mui-focused": { boxShadow: "none" },
                    }
                  : {}),
                ...(compactInputHeight
                  ? {
                      "& .MuiInputBase-input::placeholder": {
                        color: "text.secondary",
                        opacity: 1,
                        fontSize: "0.875rem",
                      },
                    }
                  : {}),
              },
              placeholder: t({
                id: "search.global.hint.canton.muni.operator",
                message: "Municipality, canton, grid operator",
              }),
              endAdornment: omitFieldSearchIcon ? (
                params.InputProps.endAdornment
              ) : (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position={"end"}>
                    <Icon name="search" />
                  </InputAdornment>
                </>
              ),
              startAdornment: inputValue ? null : (
                <InputAdornment
                  position="start"
                  sx={{
                    marginRight: bareDrawerField
                      ? "0px !important"
                      : "8px !important",
                  }}
                >
                  {!isMobile && (
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      fontSize={[16]}
                    >
                      <Trans id="search.global.hint.go.to">Go to...</Trans>
                    </Typography>
                  )}
                </InputAdornment>
              ),
            }}
          />
        )}
        filterOptions={(options) => options}
        getOptionKey={(option) => option.id}
        renderOption={(props, option) => {
          const { key, ...liProps } = props;
          return (
            <Box
              {...liProps}
              key={key}
              component="li"
              sx={{
                "&&": {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "secondary.800",
                  width: "100%",
                  fontSize: "1rem",
                  lineHeight: 1.2,
                  textDecoration: "none",
                  px: 4,
                },
                "&:hover > svg, .Mui-focusVisible & > svg": {
                  visibility: "visible",
                },
              }}
            >
              <span>{getItemLabel(option)}</span>
            </Box>
          );
        }}
      />
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
    default: {
      const _check: never = e;
      throw new Error(`Cannot dettermine entity type from ${e}`);
    }
  }
};
