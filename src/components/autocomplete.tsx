import { autocompleteClasses, ListSubheader, styled } from "@mui/material";

// Styled components for Autocomplete groups, should be removed
// once the defaultRenderGroup from MUI uses directly ListSubheader and List
export const AutocompleteGroupLabel = styled(ListSubheader, {
  name: "MuiAutocomplete",
  slot: "GroupLabel",
  overridesResolver: (props, styles) => styles.groupLabel,
})(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  top: -8,
}));

export const AutocompleteGroupUl = styled("ul", {
  name: "MuiAutocomplete",
  slot: "GroupUl",
  overridesResolver: (props, styles) => styles.groupUl,
})({
  padding: 0,
  [`& .${autocompleteClasses.option}`]: {
    paddingLeft: 24,
  },
});
