import { t, Trans } from "@lingui/macro";
import {
  Autocomplete,
  AutocompleteProps,
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
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
  const [expanded, setExpanded] = useState(false);

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
    setExpanded(false);
  };

  const handleClickAway = () => {
    setExpanded(false);
  };

  return (
    <Box
      sx={{
        position: "relative",
        py: {
          md: 4,
        },
      }}
    >
      <Box
        sx={{
          display: { xxs: "none", md: "block" },
          width: "22rem",
        }}
      >
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
          onSelection={handleSelection}
          isMobile={false}
        />
      </Box>

      <Box
        sx={{
          display: { xxs: "block", md: "none" },
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => setExpanded(true)}
          aria-label={t({ id: "search.open" })}
        >
          <Icon name="search" />
        </IconButton>

        {expanded && (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "22rem",
                backgroundColor: "background.paper",
                zIndex: 100,
                boxShadow: 2,
                animation: "width-expand 0.3s ease-in-out",
                "@keyframes width-expand": {
                  "0%": {
                    width: "44px",
                    opacity: 0.7,
                  },
                  "100%": {
                    width: "22rem",
                    opacity: 1,
                  },
                },
              }}
            >
              <SearchField
                items={items.map(({ id, __typename }) => ({
                  id,
                  __typename,
                }))}
                getItemLabel={(item) =>
                  itemById.get(item.id)?.name ?? `[${item.id}]`
                }
                setSearchString={setSearchString}
                label={
                  <Trans id="search.global.label">
                    Suche nach Gemeindename, PLZ, Netzbetreiber, Kanton
                  </Trans>
                }
                isLoading={gqlQuery.fetching && searchString.length > 0}
                onSelection={handleSelection}
                isMobile={true}
              />
            </Box>
          </ClickAwayListener>
        )}
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
}: {
  items: Item[];
  setSearchString: (searchString: string) => void;
  getItemLabel: (item: Item) => string;
  label: string | ReactNode;
  isLoading: boolean;
  onSelection: () => void;
  isMobile: boolean;
}) => {
  const { query, push } = useRouter();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

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
      onSelection();
    }
  };

  const groupedItems = useMemo(() => {
    return sortBy(items, (item) => item.__typename);
  }, [items]);

  return (
    <Box sx={{ width: "100%" }}>
      <VisuallyHidden>
        <label>{label}</label>
      </VisuallyHidden>
      <Autocomplete
        id="search-global"
        options={groupedItems}
        getOptionLabel={(item) => `${getItemLabel(item)}`}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleOptionSelect}
        noOptionsText={
          inputValue === ""
            ? t({ id: "search.global.label" })
            : t({ id: "combobox.noitems" })
        }
        loading={isLoading}
        popupIcon={null}
        size="small"
        sx={{ width: "100%" }}
        groupBy={(option) => option.__typename}
        renderGroup={(params) => (
          <React.Fragment key={params.group}>
            <Typography variant="body2" sx={{ mx: 4, mt: 4 }}>
              {getLocalizedLabel({ id: params.group })}
            </Typography>
            <Divider sx={{ mx: 4, my: 2 }} />
            {params.children}
          </React.Fragment>
        )}
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
              endAdornment: (
                <InputAdornment position="end">
                  <Icon name="search" />
                </InputAdornment>
              ),
              startAdornment: inputValue ? null : (
                <InputAdornment position="start">
                  {!isMobile && (
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      sx={{
                        fontSize: [16],
                      }}
                    >
                      <Trans id="search.global.hint.go.to">Gehe zu…</Trans>
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
    default:
      const _check: never = e;
      throw new Error(`Cannot dettermine entity type from ${e}`);
  }
};
