import { Flex, Link as UILink } from "@theme-ui/components";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "../lib/use-locale";

interface Props {
  year: string;
  priceComponent: string;
  category: string;
  // product: string;
}

export const List = ({ year, priceComponent, category }: Props) => {
  const locale = useLocale();

  return (
    <Flex
      sx={{
        width: ["auto", 320, 320],
        height: "fit-content",
        flexDirection: "column",
        justifyContent: "flex-start",
        mt: 4,
        bg: "monochrome100",
        p: 5,
        pb: 6,
        zIndex: 12,
        borderRadius: "default",
        "> button": { mt: 2 },
      }}
    >
      <Link
        href={{
          pathname: `/[locale]/municipality/[id]`,
          query: {
            year: year ?? "2020",
            priceComponent: priceComponent ?? "total",
            category: category ?? "H1",
            product: "standard",
          },
        }}
        as={{
          pathname: `/${locale}/municipality/zürich`,
          query: {
            year: year ?? "2020",
            priceComponent: priceComponent ?? "total",
            category: category ?? "H1",
            product: "standard",
          },
        }}
        passHref
      >
        <UILink
          sx={{
            p: 1,
            color: "primary",
            cursor: "pointer",
            ":hover": {
              color: "primaryHover",
            },
            ":active": {
              color: "primaryActive",
            },
          }}
        >
          Link to the municipality: Zürich
        </UILink>
      </Link>
      <Link
        href={{
          pathname: `/[locale]/provider/[id]`,
          query: {
            year: year ?? "2020",
            priceComponent: priceComponent ?? "total",
            category: category ?? "H1",
            // product: product ?? "standard",
          },
        }}
        as={{
          pathname: `/${locale}/provider/ewz`,
          query: {
            year: year ?? "2020",
            priceComponent: priceComponent ?? "total",
            category: category ?? "H1",
            // product: product ?? "standard",
          },
        }}
        passHref
      >
        <UILink
          sx={{
            p: 1,
            color: "primary",
            cursor: "pointer",
            ":hover": {
              color: "primaryHover",
            },
            ":active": {
              color: "primaryActive",
            },
          }}
        >
          Link to the provider: ewz
        </UILink>
      </Link>
      <Link
        href={{
          pathname: `/[locale]/canton/[id]`,
          query: {
            year: year ?? "2020",
            priceComponent: priceComponent ?? "total",
            category: category ?? "H1",
            // product: product ?? "standard",
          },
        }}
        as={{
          pathname: `/${locale}/canton/vaud`,
          query: {
            year: year ?? "2020",
            priceComponent: priceComponent ?? "total",
            category: category ?? "H1",
            // product: product ?? "standard",
          },
        }}
        passHref
      >
        <UILink
          sx={{
            p: 1,
            color: "primary",
            cursor: "pointer",
            ":hover": {
              color: "primaryHover",
            },
            ":active": {
              color: "primaryActive",
            },
          }}
        >
          Link to the canton: Vaud
        </UILink>
      </Link>
    </Flex>
  );
};
