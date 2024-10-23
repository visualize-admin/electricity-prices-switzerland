import { PickingInfo } from "@deck.gl/core/typed";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";
import { useCallback, useMemo, useState } from "react";

import {
  PriceComponent,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useQueryStateSingle } from "src/lib/use-query-state";
import { defaultLocale } from "src/locales/locales";

import {
  HighlightContext,
  HighlightValue,
} from "../components/highlight-context";
import { ChoroplethMap } from "../components/map";
import { useColorScale } from "../domain/data";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<Props, { locale: string }> =
  async ({ locale, req, res }) => {
    await basicAuthMiddleware(req, res);

    return {
      props: {
        locale: locale ?? defaultLocale,
      },
    };
  };

const assertBaseDomainOK = (baseDomain: string) => {
  const url = new URL(baseDomain);
  if (url.hostname.endsWith("elcom.admin.ch") || url.hostname === "localhost") {
    return true;
  }
  throw new Error("Bad baseDomain, baseDomain should end with elcom.admin.ch");
};

const IndexPage = ({ locale }: Props) => {
  const [{ period, priceComponent, category, product }] = useQueryStateSingle();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponent,
      filters: {
        period: [period],
        category: [category],
        product: [product],
      },
    },
  });

  const [municipalitiesQuery] = useAllMunicipalitiesQuery({
    variables: {
      locale,
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;

  const swissMedianObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.swissMedianObservations ?? EMPTY_ARRAY;

  const municipalities =
    municipalitiesQuery.data?.municipalities ?? EMPTY_ARRAY;

  const medianValue = swissMedianObservations[0]?.value;

  const colorAccessor = useCallback((d: { value: number }) => d.value, []);
  const colorScale = useColorScale({
    observations,
    medianValue,
    accessor: colorAccessor,
  });

  const router = useRouter();

  const baseDomain = useMemo(() => {
    const url = new URL(
      typeof window !== "undefined"
        ? window.location.href
        : "https://strompreis.elcom.admin.ch"
    );
    const urlDomain = `${url?.protocol}//${url?.hostname}${
      url?.port !== "80" ? `:${url?.port}` : ""
    }`;
    return router.query.baseDomain || urlDomain;
  }, [router.query]);

  const target =
    router.query.target && typeof router.query.target === "string"
      ? router.query.target
      : "_blank";

  assertBaseDomainOK(baseDomain as string);

  const handleMunicipalityLayerClick = ({ object }: PickingInfo) => {
    const id = object?.id.toString();
    window.open(`${baseDomain}/municipality/${id}`, target);
  };

  const [highlightContext, setHighlightContext] = useState<HighlightValue>();
  return (
    <HighlightContext.Provider
      value={{
        value: highlightContext,
        setValue: setHighlightContext,
      }}
    >
      <ChoroplethMap
        year={period}
        onMunicipalityLayerClick={handleMunicipalityLayerClick}
        observations={observations}
        municipalities={municipalities}
        observationsQueryFetching={
          observationsQuery.fetching || municipalitiesQuery.fetching
        }
        medianValue={medianValue}
        colorScale={colorScale}
      />
    </HighlightContext.Provider>
  );
};

export default IndexPage;
