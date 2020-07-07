import { ChoroplethMap } from "../../../components/map";
import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

type Props = {
  locale: string;
  year: string;
};

export const getServerSideProps: GetServerSideProps<Props, Props> = async ({
  params
}) => {
  const { locale, year } = params!
  return { props: { locale: locale.toString(), year: year.toString() } };
};

const Page = ({ year, locale }: Props) => {
  const { replace } = useRouter();
  const [category, setCategory] = useState(
    "https://energy.ld.admin.ch/elcom/energy-pricing/category/H1"
  );

  return (
    <div>
      <ChoroplethMap year={year} category={category} />
      <div style={{ position: "absolute", zIndex: 999 }}>
        <select
          value={year}
          onChange={(e) =>
            replace(
              "/[locale]/map/[year]",
              `/${locale}/map/${e.currentTarget.value}`
            )
          }
        >
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
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
