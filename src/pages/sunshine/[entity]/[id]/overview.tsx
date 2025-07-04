import { t, Trans } from "@lingui/macro";
import { Box, IconButton, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentProps, useMemo, useState } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardGrid from "src/components/card-grid";
import { Combobox } from "src/components/combobox";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import { NetworkCostsTrendCardMinified } from "src/components/network-costs-trend-card";
import { PowerStabilityCardMinified } from "src/components/power-stability-card";
import TableComparisonCard from "src/components/table-comparison-card";
import { TariffsTrendCardMinified } from "src/components/tariffs-trend-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import {
  NetworkLevel,
  SunshineCostsAndTariffsData,
  SunshineOperationalStandardsData,
  SunshinePowerStabilityData,
  tariffCategories,
  TariffCategory,
} from "src/domain/data";
import { sunshineDetailsLink } from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import {
  EnergyTariffsQuery,
  NetTariffsQuery,
  NetworkCostsQuery,
  useEnergyTariffsQuery,
  useNetTariffsQuery,
  useNetworkCostsQuery,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import {
  fetchOperationalStandards,
  fetchOperatorCostsAndTariffsData,
  fetchPowerStability,
} from "src/lib/db/sunshine-data";
import { defaultLocale } from "src/locales/config";

import {
  prepComplianceCardProps,
  prepServiceQualityCardProps,
} from "./operational-standards";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      costsAndTariffs: SunshineCostsAndTariffsData;
      powerStability: SunshinePowerStabilityData;
      operationalStandards: SunshineOperationalStandardsData;
    })
  | { status: "notfound" };

export const getServerSideProps: GetServerSideProps<
  Props,
  PageParams
> = async ({ params, res, locale }) => {
  const { id, entity } = params!;

  if (entity !== "operator") {
    return {
      props: {
        status: "notfound",
      },
    };
  }

  const operatorProps = await handleOperatorsEntity({
    id,
    locale: locale ?? defaultLocale,
    res,
  });

  if (operatorProps.status === "notfound") {
    return {
      props: {
        status: "notfound",
      },
    };
  }

  const [operationalStandards, powerStability, costsAndTariffs] =
    await Promise.all([
      fetchOperationalStandards({
        operatorId: id,
      }),
      fetchPowerStability({ operatorId: id }),
      fetchOperatorCostsAndTariffsData({
        operatorId: id,
        networkLevel: "NE5",
        category: "NC2",
      }),
    ]);

  return {
    props: {
      ...operatorProps,
      operationalStandards,
      powerStability,
      costsAndTariffs,
    },
  };
};

const OverviewPage = (props: Props) => {
  const { query } = useRouter();
  const latestYear = 2024; //FIXME: only year with data for power stability

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, entity, name } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.overview-sunshine.title",
    message: "Sunshine Indicators Overview",
  })}`;

  const bannerContent = (
    <DetailPageBanner
      id={id}
      name={name}
      municipalities={props.municipalities}
      entity={entity}
    />
  );
  const saidiYearlyObservations = useMemo(() => {
    return (
      props.powerStability.saidi.yearlyData.filter(
        (x) => x.year === latestYear
      ) ?? []
    );
  }, [props.powerStability.saidi.yearlyData, latestYear]);

  const saifiYearlyObservations = useMemo(() => {
    return (
      props.powerStability.saifi.yearlyData.filter(
        (x) => x.year === latestYear
      ) ?? []
    );
  }, [props.powerStability.saifi.yearlyData, latestYear]);

  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("EC-group") },
      ...tariffCategories.filter((x) => x.startsWith("EC")),
      { type: "header", title: getItemLabel("EH-group") },
      ...tariffCategories.filter((x) => x.startsWith("EH")),
      { type: "header", title: getItemLabel("NC-group") },
      ...tariffCategories.filter((x) => x.startsWith("NC")),
      { type: "header", title: getItemLabel("NH-group") },
      ...tariffCategories.filter((x) => x.startsWith("NH")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  const [year, setYear] = useState<string>("2025");
  const [category, setCategory] = useState<TariffCategory>("NC2");
  const [networkLevel, setNetworkLevel] = useState<NetworkLevel["id"]>("NE5");

  const sidebarContent = <DetailsPageSidebar id={id} entity={entity} />;

  const operatorId = parseInt(id, 10);
  const [networkCostsResult] = useNetworkCostsQuery({
    variables: {
      filter: {
        operatorId,
        networkLevel,
        period: latestYear,
      },
    },
  });
  const [netTariffsResult] = useNetTariffsQuery({
    variables: {
      filter: {
        operatorId,
        period: latestYear,
        category,
      },
    },
  });
  const [energyTariffsResult] = useEnergyTariffsQuery({
    variables: {
      filter: {
        operatorId,
        period: latestYear,
        category,
      },
    },
  });

  const networkCosts = networkCostsResult.data
    ?.networkCosts as NetworkCostsQuery["networkCosts"];
  const netTariffs = netTariffsResult.data
    ?.netTariffs as NetTariffsQuery["netTariffs"];
  const energyTariffs = energyTariffsResult.data
    ?.energyTariffs as EnergyTariffsQuery["energyTariffs"];

  const mainContent = (
    <>
      <DetailsPageHeader>
        <DetailsPageTitle>
          <Trans id="sunshine.overview-sunshine.title">
            Sunshine Indicators Overview
          </Trans>
        </DetailsPageTitle>
        <DetailsPageSubtitle>
          <Trans id="sunshine.overview-sunshine.description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque at tellus at leo fermentum gravida. Nam eu mollis
            lacus. Sed libero augue, porttitor at velit fringilla, blandit
            cursus ipsum. In neque metus, ultricies ut tellus et, ornare
            condimentu.
          </Trans>
        </DetailsPageSubtitle>
      </DetailsPageHeader>
      <CardGrid
        sx={{
          display: "grid",
          columnGap: 4,
          rowGap: 8,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(6, 1fr)",
          },
          gridTemplateAreas: {
            xs: `
        "row-title-1"
        "filters"
        "network-costs"
        "net-tariffs"
        "energy-tariffs"
        "row-title-2"
        "saidi"
        "saifi"
        "row-title-3"
        "service-quality"
        "compliance"
      `,
            sm: `
        "row-title-1 row-title-1 row-title-1 row-title-1 row-title-1 row-title-1"
        "filters filters filters filters filters filters"
        "network-costs network-costs net-tariffs net-tariffs energy-tariffs energy-tariffs"
        "row-title-2 row-title-2 row-title-2 row-title-2 row-title-2 row-title-2"
        "saidi saidi saidi saifi saifi saifi"
        "row-title-3 row-title-3 row-title-3 row-title-3 row-title-3 row-title-3"
        "service-quality service-quality service-quality compliance compliance compliance"
      `,
          },
        }}
      >
        <Typography variant="h2" sx={{ gridArea: "row-title-1" }}>
          <Trans id="sunshine.grid.network-costs-title">Network Costs</Trans>
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 4,
            mb: 2,
            gridArea: "filters",
            alignItems: "end",
          }}
        >
          <Combobox
            id="category"
            label={t({ id: "selector.category", message: "Category" })}
            items={groupedCategories}
            getItemLabel={getItemLabel}
            selectedItem={category}
            setSelectedItem={(item) => setCategory(item as TariffCategory)}
            //FIXME: Might need change
            infoDialogSlug="help-categories"
          />
          <ButtonGroup
            id="basic-button-group"
            label={getLocalizedLabel({ id: "network-level" })}
            options={[
              {
                value: "NE5",
                label: getLocalizedLabel({ id: "network-level.NE5.short" }),
              },
              {
                value: "NE6",
                label: getLocalizedLabel({ id: "network-level.NE6.short" }),
              },
              {
                value: "NE7",
                label: getLocalizedLabel({ id: "network-level.NE7.short" }),
              },
            ]}
            value={networkLevel}
            setValue={setNetworkLevel}
          />
        </Box>
        <NetworkCostsTrendCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.costsAndTariffs.operator.peerGroup}
          updateDate={props.costsAndTariffs.updateDate}
          networkCosts={networkCosts}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          sx={{ gridArea: "network-costs" }}
          cardDescription={getLocalizedLabel({
            id: `network-level.${networkLevel}.description`,
          })}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/costs-and-tariffs`,
                { tab: "networkCosts" }
              )}
            >
              <IconButton variant="outlined" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <TariffsTrendCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.costsAndTariffs.operator.peerGroup}
          updateDate={props.costsAndTariffs.updateDate}
          netTariffs={netTariffs}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          cardTitle={
            <Trans id="sunshine.costs-and-tariffs.net-tariffs.overview">
              Net Tariffs
            </Trans>
          }
          cardDescription={getLocalizedLabel({
            id: `selector.category.${category}.long`,
          })}
          sx={{ gridArea: "net-tariffs" }}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/costs-and-tariffs`,
                { tab: "netTariffs" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <TariffsTrendCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.costsAndTariffs.operator.peerGroup}
          updateDate={props.costsAndTariffs.updateDate}
          netTariffs={energyTariffs}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          cardTitle={
            <Trans id="sunshine.costs-and-tariffs.energy-tariffs.overview">
              Energy Tariffs
            </Trans>
          }
          cardDescription={getLocalizedLabel({
            id: `selector.category.${category}.long`,
          })}
          sx={{ gridArea: "energy-tariffs" }}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/costs-and-tariffs`,
                { tab: "energyTariffs" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />{" "}
        <Typography variant="h2" sx={{ gridArea: "row-title-2" }}>
          <Trans id="sunshine.grid.power-stability-title">
            Power Stability
          </Trans>
        </Typography>
        <PowerStabilityCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.powerStability.operator.peerGroup}
          updateDate={props.powerStability.updateDate}
          observations={saidiYearlyObservations}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          cardTitle={
            <Trans id="sunshine.power-stability.saidi-trend.overview">
              Power Outage (SAIDI)
            </Trans>
          }
          cardDescription={
            <Trans id="sunshine.power-stability.saidi-trend.description">
              Power Outage Duration
            </Trans>
          }
          sx={{ gridArea: "saidi" }}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/power-stability`,
                { tab: "saidi" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <PowerStabilityCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.powerStability.operator.peerGroup}
          updateDate={props.powerStability.updateDate}
          observations={saifiYearlyObservations}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          cardTitle={
            <Trans id="sunshine.power-stability.saifi-trend.overview">
              Power Outage (SAIFI)
            </Trans>
          }
          cardDescription={
            <Trans id="sunshine.power-stability.saifi-trend.description">
              Power Outage Frequency
            </Trans>
          }
          sx={{ gridArea: "saifi" }}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/power-stability`,
                { tab: "saifi" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <Typography variant="h2" sx={{ gridArea: "row-title-3" }}>
          <Trans id="sunshine.grid.operational-standards-title">
            Operational Standards
          </Trans>
        </Typography>
        <TableComparisonCard
          {...prepServiceQualityCardProps(props)}
          activeTab={year}
          handleTabChange={(_, value) => setYear(value)}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/operational-standards`,
                { tab: "serviceQuality" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
          sx={{ gridArea: "service-quality" }}
        />
        <TableComparisonCard
          {...prepComplianceCardProps(props)}
          activeTab={year}
          handleTabChange={(_, value) => setYear(value)}
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/operational-standards`,
                { tab: "compliance" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
          sx={{ gridArea: "compliance" }}
        />
      </CardGrid>
    </>
  );

  return (
    <DetailsPageLayout
      title={pageTitle}
      BannerContent={bannerContent}
      SidebarContent={sidebarContent}
      MainContent={mainContent}
      download={query.download}
    />
  );
};

export default OverviewPage;
