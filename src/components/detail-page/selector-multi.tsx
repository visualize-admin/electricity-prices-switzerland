import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Flex, Text } from "theme-ui";
import {
  categories,
  priceComponents,
  products,
  years,
} from "../../domain/data";
import { Combobox } from "../../components/combobox";
interface Props {
  year: string;
  priceComponent: string;
  category: string;
  // product: string;
  updateQueryParams: (queryObject: { [x: string]: string }) => void;
}

export const SelectorMulti = ({
  year,
  priceComponent,
  category,
  updateQueryParams,
}: Props) => {
  // FIXME: remove when products are in the data
  const [product, updateProduct] = useState("standard");

  return (
    <Flex
      as="fieldset"
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        bg: "primaryLight",
        px: 2,
        py: 4,
        zIndex: 13,
        "> div": { mt: 3 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Text>

      <>
        <Combobox
          id="year"
          label={<Trans id="selector.year">Jahr</Trans>}
          items={years}
          selectedItem={(year as string) ?? "2020"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ year: selectedItem })
          }
        />
        <Combobox
          id="priceComponent"
          label={<Trans id="selector.priceComponent">Preiskomponent</Trans>}
          items={priceComponents}
          selectedItem={(priceComponent as string) ?? "total"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ priceComponent: selectedItem })
          }
        />

        <Combobox
          id="category"
          label={<Trans id="selector.category">Kategorie</Trans>}
          items={categories}
          selectedItem={(category as string) ?? "H4"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ category: selectedItem })
          }
        />

        <Combobox
          id="product"
          label={<Trans id="selector.product">Produkt</Trans>}
          items={products}
          selectedItem={(product as string) ?? "standard"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateProduct(selectedItem)
          }
          // handleSelectedItemChange={({ selectedItem }) =>
          //   updateQueryParams({ product: selectedItem })
          // }
        />
      </>
    </Flex>
  );
};
