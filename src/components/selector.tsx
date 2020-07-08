import { Trans, t } from "@lingui/macro";
import { useRouter } from "next/router";
import { Flex, Text } from "theme-ui";
import { format } from "url";
import { Combobox } from "./../components/combobox";
import { useLocale } from "./../lib/use-locale";
import { I18n } from "@lingui/react";
interface Props {
  year: string;
  priceComponent: string;
  category: string;
  product: string;
}

export const years = ["2020", "2019", "2018", "2017", "2016", "2015"];
export const priceComponents = ["Total", "Abgabe", "KEV", "Grid usage"];
export const products = ["Standard", "Günstig"];
export const categories = [
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
      {
        pathname: `/[locale]/index`,
        query: { ...query, ...queryObject },
      },
      { pathname: `/${locale}`, query: { ...query, ...queryObject } }
    );
  };
  const { year, priceComponent, category, product } = query;

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

      <>
        <Combobox
          label={<Trans id="selector.year">Jahr</Trans>}
          items={years}
          // FIXME: What if several years?
          selectedItem={(year as string) ?? "2020"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ year: selectedItem })
          }
        />
        <Combobox
          label={<Trans id="selector.priceComponent">Preiskomponent</Trans>}
          items={priceComponents}
          selectedItem={(priceComponent as string) ?? "Total"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ priceComponent: selectedItem })
          }
        />

        <Combobox
          label={<Trans id="selector.category">Kategorie</Trans>}
          items={categories}
          selectedItem={(category as string) ?? "H4"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ category: selectedItem })
          }
        />
        <Combobox
          label={<Trans id="selector.product">Produkt</Trans>}
          items={products}
          selectedItem={(product as string) ?? "Standard"}
          handleSelectedItemChange={({ selectedItem }) =>
            updateQueryParams({ product: selectedItem })
          }
        />
      </>
    </Flex>
  );
};
