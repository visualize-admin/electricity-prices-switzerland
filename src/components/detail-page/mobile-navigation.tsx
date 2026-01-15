import { t } from "@lingui/macro";
import { NativeSelect } from "@mui/material";
import { useRouter } from "next/router";

import { useFlag } from "src/utils/flags";

import { SectionProps } from "./card";

export const DetailsPageMobileNavigation = (props: SectionProps) => {
  const { id, entity } = props;
  const router = useRouter();
  const sunshineFlag = useFlag("sunshine");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value) {
      router.push(value);
    }
  };

  // Get current path without query params and hash
  const currentPath = router.asPath.split("?")[0].split("#")[0];

  return (
    <NativeSelect value={currentPath} onChange={handleChange} fullWidth>
      <optgroup
        label={t({
          id: "details.page.navigation.electricity-insights-title",
          message: "Insights into electricity",
        })}
      >
        <option value={`/${entity}/${id}`}>
          {t({
            id: "details.page.navigation.electricity-tariffs-item",
            message: "Electricity tariffs",
          })}
        </option>
      </optgroup>

      {sunshineFlag && entity === "operator" ? (
        <optgroup
          label={t({
            id: "details.page.navigation.sunshine-indicators-title",
            message: "Sunshine Indicators",
          })}
        >
          <option value={`/sunshine/${entity}/${id}/overview`}>
            {t({
              id: "details.page.navigation.sunshine-overview-item",
              message: "Overview",
            })}
          </option>
          <option value={`/sunshine/${entity}/${id}/costs-and-tariffs`}>
            {t({
              id: "details.page.navigation.costs-and-tariffs-item",
              message: "Costs and Tariffs",
            })}
          </option>
          <option value={`/sunshine/${entity}/${id}/power-stability`}>
            {t({
              id: "details.page.navigation.power-stability-item",
              message: "Power Stability",
            })}
          </option>
          <option value={`/sunshine/${entity}/${id}/operational-standards`}>
            {t({
              id: "details.page.navigation.operational-standards-item",
              message: "Operational Standards",
            })}
          </option>
        </optgroup>
      ) : null}
    </NativeSelect>
  );
};
