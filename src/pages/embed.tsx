import { GetServerSideProps } from "next";
import { useCallback, useMemo, useState } from "react";

import { EnergyPricesMap } from "src/components/energy-prices-map";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { MapProvider } from "src/components/map-context";
import { colorScaleSpecs, makeColorScale } from "src/domain/charts";
import { PriceComponent } from "src/domain/data";
import { useQueryStateEnergyPricesMap } from "src/domain/query-states";
import { PriceComponent as PriceComponentEnum } from "src/graphql/queries";
import { useEnrichedEnergyPricesData } from "src/hooks/use-enriched-energy-prices-data";
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

// FIXME Support Sunshine indicators
const IndexPage = ({ locale }: Props) => {
  const [{ period, priceComponent, category, product }] =
    useQueryStateEnergyPricesMap();

  const enrichedEnergyPrices = useEnrichedEnergyPricesData({
    locale,
    priceComponent: priceComponent as PriceComponentEnum,
    filters: {
      period: [period],
      category: [category],
      product: [product],
    },
  });

  const observations = enrichedEnergyPrices.data?.observations ?? EMPTY_ARRAY;

  const swissMedianObservations =
    enrichedEnergyPrices.data?.swissMedianObservations ?? EMPTY_ARRAY;

  const medianValue = swissMedianObservations[0]?.value;

  const isValidValue = <T extends { value?: number | null | undefined }>(
    x: T
  ): x is T & { value: number } => x.value !== undefined && x.value !== null;

  const colorAccessor = useCallback((d: { value: number }) => d.value, []);
  const colorScale = useMemo(() => {
    return makeColorScale(
      colorScaleSpecs.energyPrices,
      medianValue,
      observations.filter(isValidValue).map(colorAccessor),
      +period
    );
  }, [colorAccessor, medianValue, observations, period]);

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
          period={period}
          enrichedDataQuery={enrichedEnergyPrices}
          priceComponent={priceComponent as PriceComponent}
          colorScale={colorScale}
        />
      </HighlightContext.Provider>
    </MapProvider>
  );
};

export default IndexPage;
