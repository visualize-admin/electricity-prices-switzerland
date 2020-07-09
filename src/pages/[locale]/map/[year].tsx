import { ChoroplethMap } from "../../../components/map";
import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useObservationsQuery, PriceComponent } from "../../../graphql/queries";
import { scaleQuantile, interpolateRdYlGn, scaleSequential } from "d3";

type Props = {
  locale: string;
  year: string;
};

export const getServerSideProps: GetServerSideProps<Props, Props> = async ({
  params,
}) => {
  const { locale, year } = params!;
  return { props: { locale: locale.toString(), year: year.toString() } };
};

const EMPTY_ARRAY: never[] = [];

const Page = ({ year, locale }: Props) => {
  const { replace } = useRouter();
  const [category, setCategory] = useState(
    "https://energy.ld.admin.ch/elcom/energy-pricing/category/H1"
  );

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent: PriceComponent.Total, // TODO: parameterize priceComponent
      filters: {
        period: [year],
        category: [category],
      },
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  // TODO: Replace this with proper color scale
  const _colorScale = scaleQuantile()
    .domain(observations.map((d) => d.value))
    .range([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);

  // TODO: Replace with proper color interpolator
  const colorScale = scaleSequential((t) =>
    interpolateRdYlGn(1 - _colorScale(t))
  );

  return (
    <div>
      <ChoroplethMap
        year={year}
        observations={observations}
        colorScale={undefined}
      />
      <div style={{ position: "absolute", zIndex: 999 }}>
        <select
          value={year}
          onChange={(e) =>
            replace("/[locale]/map/[year]", {
              pathname: `/${locale}/map/${e.currentTarget.value}`,
            })
          }
        >
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.currentTarget.value)}
        >
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/H1">
            H1
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/H2">
            H2
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/H3">
            H3
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/H4">
            H4
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/C1">
            C1
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/C2">
            C2
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/C3">
            C3
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/C4">
            C4
          </option>
          <option value="https://energy.ld.admin.ch/elcom/energy-pricing/category/C5">
            C5
          </option>
        </select>
      </div>
    </div>
  );
};

export default Page;
