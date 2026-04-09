import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import {
  Box,
  BoxProps,
  Card,
  CardContent,
  CardProps,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { LatestYearDotsChartView } from "src/components/charts-generic/latest-year-dots-chart-view";
import { ProgressOvertimeChart } from "src/components/charts-generic/progress-overtime-chart";
import { NoDataHint } from "src/components/hint";
import { ColorMapping, createColorMapping } from "src/domain/color-mapping";
import type { GenericObservation } from "src/domain/data";
import { filterBySeparator } from "src/domain/helpers";
import { useFormatCurrency } from "src/domain/helpers";
import { DAYS, SWISS_FRANCS } from "src/domain/metrics";
import type { CompareWithFilter, ViewByFilter } from "src/domain/query-states";
import { useQueryStateOperationalStandardsChartFilters } from "src/domain/query-states";
import { isPeerGroupRow, PeerGroup } from "src/domain/sunshine";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";
import {
  OperationalStandardsComplianceTrendRow,
  OperationalStandardsServiceQualityTrendRow,
} from "src/graphql/resolver-types";
import { NonNullableProp } from "src/utils/non-nullable-prop";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { ItemMultiCombobox } from "./query-combobox";

const DOWNLOAD_ID_SERVICE_QUALITY: Download =
  "operational-standards-service-quality";
const DOWNLOAD_ID_COMPLIANCE: Download = "operational-standards-compliance";

/** Latest-year view: one Y band; operators are segments (like network costs), not one row per operator. */
const OPERATIONAL_LATEST_YEAR_Y_FIELD = "comparison_strip";
/** Placeholder label for the single strip (arbitrary; kept minimal on the axis). */
const OPERATIONAL_LATEST_YEAR_STRIP_LABEL = "\u00a0";

type StandardAttribute = "serviceQuality" | "compliance";

type OperationalStandardsChartFilters = {
  compareWith?: CompareWithFilter;
  viewBy?: ViewByFilter;
};

type OperationalStandardsChartProps = {
  rootProps?: Omit<BoxProps, "children">;
  standardAttribute: StandardAttribute;
  observations: Array<
    | OperationalStandardsServiceQualityTrendRow
    | OperationalStandardsComplianceTrendRow
  >;
  peerMedianLatest?: number | null;
  operatorLabel: string;
  id: string;
  mini?: boolean;
  compact?: boolean;
  colorMapping?: ColorMapping;
} & OperationalStandardsChartFilters;

/** Renders **yearlyData** rows (multi-year + peer median), not `operators*` snapshot arrays. */
const OperationalStandardsChart = (props: OperationalStandardsChartProps) => {
  const {
    observations,
    viewBy,
    rootProps,
    colorMapping,
    standardAttribute,
    peerMedianLatest,
    ...restProps
  } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);
  return (
    <Box {...rootProps}>
      {viewBy === "latest" ? (
        <OperationalLatestYearChartView
          observations={observations}
          operatorsNames={operatorsNames}
          colorMapping={colorMapping}
          standardAttribute={standardAttribute}
          peerMedianLatest={peerMedianLatest}
          {...restProps}
        />
      ) : (
        <OperationalProgressChartView
          observations={observations}
          operatorsNames={operatorsNames}
          colorMapping={colorMapping}
          standardAttribute={standardAttribute}
          {...restProps}
        />
      )}
    </Box>
  );
};

const OperationalLatestYearChartView = ({
  observations,
  operatorsNames: _operatorsNames,
  colorMapping,
  standardAttribute,
  id,
  operatorLabel,
  compareWith,
  compact,
  peerMedianLatest,
}: Omit<OperationalStandardsChartProps, "viewBy" | "rootProps"> & {
  operatorsNames: Set<string>;
}) => {
  const entityField = "operator_id";
  const { i18n } = useLingui();

  const mappedObservations = useMemo((): GenericObservation[] => {
    if (standardAttribute === "serviceQuality") {
      const rows = observations as OperationalStandardsServiceQualityTrendRow[];
      return rows
        .map((o) => ({
          ...o,
          year: o.year,
          [OPERATIONAL_LATEST_YEAR_Y_FIELD]:
            OPERATIONAL_LATEST_YEAR_STRIP_LABEL,
        }))
        .filter(
          (x): x is NonNullableProp<typeof x, "days"> =>
            !isPeerGroupRow(x) && x.days !== null
        ) as GenericObservation[];
    }
    const rows = observations as OperationalStandardsComplianceTrendRow[];
    return rows
      .map((o) => ({
        ...o,
        year: o.year,
        [OPERATIONAL_LATEST_YEAR_Y_FIELD]: OPERATIONAL_LATEST_YEAR_STRIP_LABEL,
      }))
      .filter(
        (x): x is NonNullableProp<typeof x, "francsPerInvoice"> =>
          !isPeerGroupRow(x) && x.francsPerInvoice !== null
      ) as GenericObservation[];
  }, [observations, standardAttribute]);

  if (mappedObservations.length === 0) {
    return <NoDataHint />;
  }

  if (standardAttribute === "serviceQuality") {
    return (
      <LatestYearDotsChartView
        observations={mappedObservations}
        medianValue={peerMedianLatest ?? undefined}
        id={id}
        operatorLabel={operatorLabel}
        compareWith={compareWith}
        colorMapping={colorMapping}
        entityField={entityField}
        compact={compact}
        xField={{
          componentIri: "days",
          axisLabel: i18n._(DAYS),
        }}
        yField={{ componentIri: OPERATIONAL_LATEST_YEAR_Y_FIELD }}
        segmentField={{
          componentIri: "operator_name",
          palette: compareWith?.includes("sunshine.select-all")
            ? "elcom-categorical-3"
            : "elcom2",
        }}
        tooltipField={{
          componentIri: "year",
        }}
        measures={[{ iri: "days", label: "Days", __typename: "Measure" }]}
        dimensions={[
          {
            iri: "operator_name",
            label: "Operator",
            __typename: "NominalDimension",
          },
        ]}
        aspectRatio={0.15}
        medianLegend={t({
          id: "legend-item.peer-group-median",
          message: "Peer Group Median",
        })}
        otherOperatorsLegend={t({
          id: "legend-item.other-operators",
          message: "Other operators",
        })}
      />
    );
  }

  return (
    <LatestYearDotsChartView
      observations={mappedObservations}
      medianValue={peerMedianLatest ?? undefined}
      id={id}
      operatorLabel={operatorLabel}
      compareWith={compareWith}
      colorMapping={colorMapping}
      entityField={entityField}
      compact={compact}
      xField={{
        componentIri: "francsPerInvoice",
        axisLabel: i18n._(SWISS_FRANCS),
      }}
      yField={{ componentIri: OPERATIONAL_LATEST_YEAR_Y_FIELD }}
      segmentField={{
        componentIri: "operator_name",
        palette: compareWith?.includes("sunshine.select-all")
          ? "elcom-categorical-3"
          : "elcom2",
      }}
      tooltipField={{
        componentIri: "year",
      }}
      measures={[
        {
          iri: "francsPerInvoice",
          label: "CHF / invoice",
          __typename: "Measure",
        },
      ]}
      dimensions={[
        {
          iri: "operator_name",
          label: "Operator",
          __typename: "NominalDimension",
        },
      ]}
      aspectRatio={0.15}
      medianLegend={t({
        id: "legend-item.peer-group-median",
        message: "Peer Group Median",
      })}
      otherOperatorsLegend={t({
        id: "legend-item.other-operators",
        message: "Other operators",
      })}
    />
  );
};

const OperationalProgressChartView = ({
  observations,
  operatorLabel,
  operatorsNames,
  compareWith = [],
  colorMapping,
  mini,
  standardAttribute,
}: Omit<OperationalStandardsChartProps, "viewBy" | "rootProps"> & {
  operatorsNames: Set<string>;
}) => {
  const formatCurrency = useFormatCurrency();
  const { i18n } = useLingui();

  const validObservations = useMemo((): GenericObservation[] => {
    if (standardAttribute === "serviceQuality") {
      return (
        observations as OperationalStandardsServiceQualityTrendRow[]
      ).filter(
        (
          d
        ): d is NonNullableProp<
          OperationalStandardsServiceQualityTrendRow,
          "days"
        > => d.days !== null
      ) as GenericObservation[];
    }
    return (observations as OperationalStandardsComplianceTrendRow[]).filter(
      (
        d
      ): d is NonNullableProp<
        OperationalStandardsComplianceTrendRow,
        "francsPerInvoice"
      > => d.francsPerInvoice !== null
    ) as GenericObservation[];
  }, [observations, standardAttribute]);

  if (observations.length === 0 || validObservations.length === 0) {
    return <NoDataHint />;
  }

  if (standardAttribute === "serviceQuality") {
    return (
      <ProgressOvertimeChart
        observations={validObservations}
        operatorLabel={operatorLabel}
        operatorsNames={operatorsNames}
        compareWith={compareWith}
        colorMapping={colorMapping}
        mini={mini}
        xField="year"
        yField="days"
        yAxisLabel={i18n._(DAYS)}
        yAxisFormat={(d) => String(d)}
        entityField="operator_id"
      />
    );
  }

  return (
    <ProgressOvertimeChart
      observations={validObservations}
      operatorLabel={operatorLabel}
      operatorsNames={operatorsNames}
      compareWith={compareWith}
      colorMapping={colorMapping}
      mini={mini}
      xField="year"
      yField="francsPerInvoice"
      yAxisLabel={i18n._(SWISS_FRANCS)}
      yAxisFormat={(d) => formatCurrency(d)}
      entityField="operator_id"
    />
  );
};

type OperationalStandardsChartCardProps = {
  peerGroup: PeerGroup;
  updateDate: string;
  operatorId: string;
  operatorLabel: string;
  latestYear: number;
  standardAttribute: StandardAttribute;
  yearlyData:
    | OperationalStandardsServiceQualityTrendRow[]
    | OperationalStandardsComplianceTrendRow[];
  state: ReturnType<typeof useQueryStateOperationalStandardsChartFilters>[0];
  setQueryState: ReturnType<
    typeof useQueryStateOperationalStandardsChartFilters
  >[1];
} & CardProps;

export const OperationalStandardsChartCardState = (
  props: Omit<OperationalStandardsChartCardProps, "state" | "setQueryState">
) => {
  const [state, setQueryState] =
    useQueryStateOperationalStandardsChartFilters();
  return (
    <OperationalStandardsChartCard
      {...props}
      state={state}
      setQueryState={setQueryState}
    />
  );
};

const OperationalStandardsChartCard: React.FC<
  OperationalStandardsChartCardProps
> = (props) => {
  const {
    state,
    setQueryState,
    peerGroup,
    operatorId,
    operatorLabel,
    updateDate,
    latestYear,
    standardAttribute,
    yearlyData,
    ...cardRest
  } = props;
  const { opStdCompareWith, opStdViewBy } = state;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  const { observations, multiComboboxOptions, peerMedianLatest } =
    useMemo(() => {
      const multiComboboxOptions: Array<
        | OperationalStandardsServiceQualityTrendRow
        | OperationalStandardsComplianceTrendRow
      > = [];
      const observations: Array<
        | OperationalStandardsServiceQualityTrendRow
        | OperationalStandardsComplianceTrendRow
      > = [];
      let peerMedianLatest: number | null = null;

      yearlyData.forEach((d) => {
        const isLatestYear = d.year === latestYear;
        const operatorIdStr = d.operator_id.toString();
        const isSelected =
          state.opStdCompareWith?.includes("sunshine.select-all") ||
          state.opStdCompareWith?.includes(operatorIdStr) ||
          operatorIdStr === operatorId ||
          isPeerGroupRow(d);
        if (
          (state.opStdViewBy === "latest" ? isLatestYear : true) &&
          isSelected
        ) {
          observations.push(d);
        }
        if (isLatestYear && isPeerGroupRow(d)) {
          if (standardAttribute === "serviceQuality") {
            const row = d as OperationalStandardsServiceQualityTrendRow;
            if (row.days !== null && row.days !== undefined) {
              peerMedianLatest = row.days;
            }
          } else {
            const row = d as OperationalStandardsComplianceTrendRow;
            if (
              row.francsPerInvoice !== null &&
              row.francsPerInvoice !== undefined
            ) {
              peerMedianLatest = row.francsPerInvoice;
            }
          }
        }
        if (
          isLatestYear &&
          operatorIdStr !== operatorId &&
          !isPeerGroupRow(d)
        ) {
          multiComboboxOptions.push(d);
        }
      });
      return { observations, multiComboboxOptions, peerMedianLatest };
    }, [
      yearlyData,
      standardAttribute,
      state.opStdCompareWith,
      state.opStdViewBy,
      latestYear,
      operatorId,
    ]);

  const downloadId =
    standardAttribute === "serviceQuality"
      ? DOWNLOAD_ID_SERVICE_QUALITY
      : DOWNLOAD_ID_COMPLIANCE;

  const filterState = {
    compareWith: opStdCompareWith,
    viewBy: opStdViewBy,
  };

  return (
    <Card {...cardRest} id={downloadId}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              <DownloadImage
                iconOnly
                iconSize={24}
                elementId={downloadId}
                fileName={downloadId}
                downloadType={downloadId}
              />
            </>
          }
        >
          <Typography variant="h3">
            {standardAttribute === "serviceQuality" ? (
              <Trans id="sunshine.operational-standards.service-quality-trend-title">
                Notification period trend
              </Trans>
            ) : (
              <Trans id="sunshine.operational-standards.compliance-trend-title">
                75 francs rule trend
              </Trans>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <Trans id="sunshine.operational-standards.benchmarking-peer-group">
              Benchmarking within the Peer Group: {peerGroupLabel}
            </Trans>
          </Typography>
        </CardHeader>
        <Box
          sx={{
            mb: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 1fr",
            },
            gap: 4,
            overflow: "hidden",
          }}
        >
          <Box width="100%">
            <ButtonGroup
              id="operational-standards-view-by"
              label={getLocalizedLabel({
                id: "costs-and-tariffs.view-by",
              })}
              fitLabelToContent
              options={[
                {
                  value: "latest",
                  label: getLocalizedLabel({
                    id: "costs-and-tariffs.latest-year-option",
                  }),
                },
                {
                  value: "progress",
                  label: getLocalizedLabel({
                    id: "costs-and-tariffs.progress-over-time",
                  }),
                },
              ]}
              value={opStdViewBy}
              asSelect="on-mobile"
              setValue={(value) =>
                setQueryState({
                  ...state,
                  opStdViewBy: value as ViewByFilter,
                })
              }
            />
          </Box>
          <div>
            <ItemMultiCombobox
              colorMapping={createColorMapping(opStdCompareWith, "elcom2")}
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              InputProps={
                opStdCompareWith.length === 0
                  ? {
                      placeholder: t({
                        id: "sunshine.costs-and-tariffs.compare-with-placeholder",
                        message: "Select operators to compare",
                      }),
                    }
                  : {}
              }
              items={multiComboboxOptions.map((item) => ({
                id: String(item.operator_id),
                name: item.operator_name,
              }))}
              selectedItems={opStdCompareWith}
              setSelectedItems={(items) =>
                setQueryState({
                  ...state,
                  opStdCompareWith: filterBySeparator(
                    items,
                    opStdCompareWith ?? [],
                    "sunshine.select-all"
                  ),
                })
              }
            />
          </div>
        </Box>
        <OperationalStandardsChart
          rootProps={{ sx: { mt: 8 } }}
          standardAttribute={standardAttribute}
          id={operatorId}
          operatorLabel={operatorLabel}
          observations={observations}
          peerMedianLatest={peerMedianLatest}
          compareWith={filterState.compareWith}
          viewBy={filterState.viewBy}
          colorMapping={createColorMapping(opStdCompareWith, "elcom2")}
        />
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};
