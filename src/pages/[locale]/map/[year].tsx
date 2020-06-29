import { ChoroplethMap } from "../../../components/map";
import { useState } from "react";
import { useRouter } from "next/router";

const Page = () => {
  const { query, replace } = useRouter();

  return (
    <div>
      <ChoroplethMap year={query.year.toString()} />
      <div style={{ position: "absolute", zIndex: 999 }}>
        <select
          value={query.year.toString()}
          onChange={(e) =>
            replace(
              "/[locale]/map/[year]",
              `/${query.locale}/map/${e.currentTarget.value}`
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
