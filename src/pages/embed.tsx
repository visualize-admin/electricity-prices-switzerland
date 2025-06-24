import { GetServerSideProps } from "next";
import { useCallback, useState } from "react";

import { EnergyPricesMap } from "src/components/energy-prices-map";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { MapProvider } from "src/components/map-context";
import { useColorScale } from "src/domain/data";
import { useQueryStateEnergyPricesMap } from "src/domain/query-states";
import {
  PriceComponent,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { defaultLocale } from "src/locales/config";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async ({ locale }) => {
  return {
    props: {
      locale: locale ?? defaultLocale,
    },
  };
};

const IndexPage = ({ locale }: Props) => {
  const [{ period, priceComponent, category, product }] =
    useQueryStateEnergyPricesMap();

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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlightContext, setHighlightContext] = useState<HighlightValue>();
  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId} embed>
      <HighlightContext.Provider
        value={{
          value: highlightContext,
          setValue: setHighlightContext,
        }}
      >
        <EnergyPricesMap
          year={period}
          observations={observations}
          municipalities={municipalities}
          observationsQueryFetching={
            observationsQuery.fetching || municipalitiesQuery.fetching
          }
          medianValue={medianValue}
          colorScale={colorScale}
        />
      </HighlightContext.Provider>
    </MapProvider>
  );
};

export default IndexPage;
