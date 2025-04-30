import { t, Trans } from "@lingui/macro";
import {
  Autocomplete,
  AutocompleteProps,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  outlinedInputClasses,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { rollup } from "d3";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { VisuallyHidden } from "src/components/visually-hidden";
import { analyticsSiteSearch } from "src/domain/analytics";
import { getLocalizedLabel } from "src/domain/translation";
import { useSearchQuery } from "src/graphql/queries";
import { Icon } from "src/icons";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

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
    <SearchField
      items={items.map(({ id, __typename }) => ({
        id,
        __typename,
      }))}
      getItemLabel={(item) => itemById.get(item.id)?.name ?? `[${item.id}]`}
      setSearchString={setSearchString}
      label={
        <Trans id="search.global.label">
          Suche nach Gemeindename, PLZ, Netzbetreiber, Kanton
        </Trans>
      }
      isLoading={gqlQuery.fetching && searchString.length > 0}
    />
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
}: {
  items: Item[];
  setSearchString: (searchString: string) => void;
  getItemLabel: (item: Item) => string;
  label: string | ReactNode;
  isLoading: boolean;
}) => {
  const theme = useTheme();
  const { query, push } = useRouter();
  const [inputValue, setInputValue] = useState("");

  type SearchAutocompleteProps = AutocompleteProps<Item, false, false, false>;
  const handleInputChange: SearchAutocompleteProps["onInputChange"] = (
    event,
    value
  ) => {
    if (!event) {
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
    }
  };

  const groupedItems = useMemo(() => {
    return sortBy(items, (item) => item.__typename);
  }, [items]);

  const inputRef = useRef<HTMLInputElement>(null);

  debugger;

  return (
    <Box>
      <VisuallyHidden>
        <label>{label}</label>
      </VisuallyHidden>
      <Autocomplete
        id="search-global"
        options={groupedItems}
        getOptionLabel={(item) => `${getItemLabel(item)}`}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        sx={{
          [theme.breakpoints.down("md")]: {
            "&.Mui-focused": {
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              background: "white",
              outline: 0,
              border: 0,
            },
            [`& .Mui-focused.${outlinedInputClasses.root} .${outlinedInputClasses.notchedOutline}`]:
              {
                outline: 0,
                borderWidth: `0`,
                borderBottom: "1px solid",

                borderBottomColor: theme.palette.grey[300],
              },
          },
        }}
        groupBy={(option) => option.__typename}
        renderGroup={(params) => {
          return (
            <React.Fragment key={params.group}>
              <Typography variant="body2" sx={{ mx: 4, my: 4 }}>
                {getLocalizedLabel({ id: params.group })}
                <Divider />
              </Typography>
              {params.children}
            </React.Fragment>
          );
        }}
        onChange={handleOptionSelect}
        noOptionsText={
          inputValue === ""
            ? t({ id: "search.global.label" })
            : t({ id: "combobox.noitems" })
        }
        loading={isLoading}
        popupIcon={null}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            inputRef={inputRef}
            InputProps={{
              ...params.InputProps,
              sx: {
                px: "16px !important",

                borderRadius: 0.5,
                height: 44,
                borderColor: "monochrome.500",
              },
              placeholder: t({ id: "search.global.hint.canton.muni.operator" }),
              endAdornment: <Icon name="search" />,
              startAdornment: (
                <InputAdornment position="start" sx={{ display: "flex" }}>
                  <IconButton
                    onClick={(ev) => {
                      ev.preventDefault();
                      setTimeout(() => {
                        inputRef.current?.blur();
                      }, 1);
                    }}
                    color="primary"
                    sx={{
                      display: "none",
                      [theme.breakpoints.down("sm")]: {
                        ".Mui-focused &": {
                          display: "block",
                        },
                      },
                    }}
                  >
                    <Icon name="chevronleft" />
                  </IconButton>
                  {inputValue ? null : (
                    <>
                      <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{
                          fontSize: [16],
                          [theme.breakpoints.down("sm")]: { display: "none" },
                        }}
                      >
                        <Trans id="search.global.hint.go.to">Gehe zu…</Trans>
                      </Typography>
                    </>
                  )}
                </InputAdornment>
              ),
            }}
          />
        )}
        filterOptions={(options) => {
          return options;
        }}
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
                  color: "grey.800",
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
              <Icon name="chevronright" />
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
    default:
      const _check: never = e;
      throw new Error(`Cannot dettermine entity type from ${e}`);
  }
};
