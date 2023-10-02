import { Box } from "@mui/material";

import { SearchField as SearchFieldComponent } from "src/components/search";

export const SearchField = () => (
  <>
    <SearchFieldComponent
      query={{}}
      onSelectItem={() => undefined}
      items={[
        { id: "12345", __typename: "CantonResult" },
        { id: "12345", __typename: "CantonResult" },
        { id: "12345", __typename: "CantonResult" },
      ]}
      setSearchString={() => {}}
      getItemLabel={function (item: string): string {
        return item;
      }}
      label={"Gehe zu..."}
      isLoading={false}
    />
    <Box sx={{ width: 300, mt: 2 }}>
      <SearchFieldComponent
        query={{}}
        onSelectItem={() => undefined}
        items={[
          { id: "12345", __typename: "CantonResult" },
          { id: "12345", __typename: "CantonResult" },
          { id: "12345", __typename: "CantonResult" },
        ]}
        setSearchString={() => {}}
        getItemLabel={function (item: string): string {
          return item;
        }}
        label={"Gehe zu..."}
        isLoading={false}
      />
    </Box>
  </>
);

export default {
  title: "Components / Search Field",
  component: SearchFieldComponent,
};
