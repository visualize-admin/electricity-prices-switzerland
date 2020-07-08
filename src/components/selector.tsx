import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import { Flex, Text } from "theme-ui";
import { format } from "url";
import { Combobox } from "./../components/combobox";
import { useLocale } from "./../lib/use-locale";

interface Props {
  locale: string;
  year: string;
  priceComponent: string;
  categorie: string;
  product: string;
}
const years = ["2020", "2019", "2018", "2017", "2016", "2015"];
const priceComponents = ["Total", "Abgabe", "KEV", "Grid usage"];
const products = ["Standard", "Günstig"];
const categories = [
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "H7",
  "H8",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
];
export const Selector = () => {
  const locale = useLocale();

  const { replace, query } = useRouter();

  const updateQueryParams = (queryObject: { [x: string]: string }) => {
    replace(
      format({
        pathname: `/[locale]/index`,
        query: { ...query, ...queryObject },
      }),
      format({ pathname: `/${locale}`, query: { ...query, ...queryObject } }),
      { shallow: true }
    );
  };
  const { year, priceComponent, category, product } = query;

  const updateYear = ({ selectedItem }) => {
    updateQueryParams({ year: selectedItem });
  };
  const updatePriceComponent = ({ selectedItem }) => {
    updateQueryParams({ priceComponent: selectedItem });
  };
  const updateCategory = ({ selectedItem }) => {
    updateQueryParams({ category: selectedItem });
  };
  const updateProduct = ({ selectedItem }) => {
    updateQueryParams({ product: selectedItem });
  };
  return (
    <Flex
      as="fieldset"
      sx={{
        width: ["auto", 320, 320],
        height: "fit-content",
        flexDirection: "column",
        justifyContent: "flex-start",
        m: 4,
        bg: "primaryLight",
        p: 5,
        pb: 6,
        borderRadius: "default",
        "> div": { mt: 5 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Text>
      <Combobox
        label={<Trans id="selector.year">Jahr</Trans>}
        items={years}
        // FIXME: What if several years?
        selectedItem={(year as string) ?? "2020"}
        handleSelectedItemChange={updateYear}
      />
      <Combobox
        label={<Trans id="selector.priceComponent">Preiskomponent</Trans>}
        items={priceComponents}
        selectedItem={(priceComponent as string) ?? "Total"}
        handleSelectedItemChange={updatePriceComponent}
      />

      <Combobox
        label={<Trans id="selector.category">Kategorie</Trans>}
        items={categories}
        selectedItem={(category as string) ?? "H4"}
        handleSelectedItemChange={updateCategory}
      />
      <Combobox
        label={<Trans id="selector.product">Produkt</Trans>}
        items={products}
        selectedItem={(product as string) ?? "Standard"}
        handleSelectedItemChange={updateProduct}
      />
    </Flex>
  );
};
