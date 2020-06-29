import { ChoroplethMap } from "../../../components/map";
import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

type Props = {
  locale: string;
  year: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params: { locale, year },
}) => {
  return { props: { locale: locale.toString(), year: year.toString() } };
};

const Page = ({ year, locale }: Props) => {
  const { replace } = useRouter();

  return (
    <div>
      <ChoroplethMap year={year} />
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
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
        </select>
      </div>
    </div>
  );
};

export default Page;
