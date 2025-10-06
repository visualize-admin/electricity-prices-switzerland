import { z } from "zod";

const SortingOrder = z.union([z.literal("asc"), z.literal("desc")]);
export type SortingOrder = z.infer<typeof SortingOrder>;

const SortingType = z.union([
  z.literal("byDimensionLabel"),
  z.literal("byMeasure"),
  z.literal("byTotalSize"),
  z.literal("byExternalValue"),
]);
export type SortingType = z.infer<typeof SortingType>;

const ColorMapping = z.record(z.string(), z.string());

const GenericField = z.object({ componentIri: z.string() });

const AxisField = z.object({
  axisLabel: z.string().optional(),
});
const Observation = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);

const SegmentField = z.object({
  componentIri: z.string(),
  type: z.union([z.literal("stacked"), z.literal("grouped")]),
  palette: z.string(),
  colorMapping: ColorMapping.optional(),
  sorting: z
    .object({
      sortingType: SortingType,
      sortingOrder: SortingOrder,
      valueAccessor: z
        .object({
          prop: z.string(),
          value: z.any().optional(),
        })
        .optional(),
    })
    .optional(),
});

const BarFields = z.object({
  x: z.intersection(
    AxisField,
    z.object({
      componentIri: z.union([z.string(), z.array(z.string())]),
    })
  ),
  domain: z.array(z.number()),
  y: z.object({
    componentIri: z.string(),
    sorting: z
      .object({
        sortingType: SortingType,
        sortingOrder: SortingOrder,
      })
      .optional(),
  }),
  annotation: z.array(Observation).optional(),

  height: GenericField.optional(),
  segment: SegmentField.optional(),
  label: GenericField.optional(),
  style: z
    .object({
      colorDomain: z.array(z.string()),
      opacityDomain: z.array(z.string()),
      colorAcc: z.string(),
      opacityAcc: z.string(),
      highlightValue: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
});
export type BarFields = z.infer<typeof BarFields>;

const ColumnFields = z.object({
  x: z.object({
    componentIri: z.string(),
    sorting: z
      .object({
        sortingType: SortingType,
        sortingOrder: SortingOrder,
      })
      .optional(),
  }),
  y: GenericField,
  segment: SegmentField.optional(),
});
type ColumnFields = z.infer<typeof ColumnFields>;

const LineFields = z.object({
  x: z.intersection(GenericField, AxisField),
  y: z.intersection(GenericField, AxisField),
  segment: z
    .object({
      componentIri: z.string(),
      palette: z.string(),
      colorMapping: ColorMapping.optional(),
    })
    .optional(),
  style: z
    .object({
      entity: z.string(),
      colorDomain: z.array(z.string()),
      colorAcc: z.string(),
    })
    .optional(),
});

export type LineFields = z.infer<typeof LineFields>;

const DotPlotFields = z.object({
  x: z.intersection(GenericField, AxisField),
  y: z.intersection(GenericField, AxisField),
  segment: z
    .object({
      componentIri: z.string(),
      palette: z.string(),
      colorMapping: ColorMapping.optional(),
    })
    .optional(),
  style: z
    .object({
      entity: z.string(),
      colorDomain: z.array(z.string()),
      colorAcc: z.string(),
      highlightValue: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  tooltip: z
    .object({
      componentIri: z.string(),
    })
    .optional(),
});

export type DotPlotFields = z.infer<typeof DotPlotFields>;

const AreaFields = z.object({
  x: GenericField,
  y: GenericField,
  segment: z
    .object({
      componentIri: z.string(),
      palette: z.string(),
      colorMapping: ColorMapping.optional(),
      sorting: z
        .object({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        })
        .optional(),
    })
    .optional(),
});

type AreaFields = z.infer<typeof AreaFields>;

const HistogramFields = z.object({
  x: GenericField,
  label: GenericField,
  segment: SegmentField.optional(),
  annotation: z.array(Observation).optional(),
  style: z
    .object({
      colorAcc: z.string().optional(),
      palette: z.string().optional(),
    })
    .optional(),
});
export type HistogramFields = z.infer<typeof HistogramFields>;

const RangePlotFields = z.object({
  x: z.intersection(GenericField, AxisField),
  y: z.object({
    componentIri: z.string(),
    sorting: z
      .object({
        sortingType: SortingType,
        sortingOrder: SortingOrder,
      })
      .optional(),
  }),
  label: GenericField,
  annotation: z.array(Observation).optional(),
});

export type RangePlotFields = z.infer<typeof RangePlotFields>;

export type ChartFields =
  | ColumnFields
  | BarFields
  | AreaFields
  | LineFields
  | HistogramFields
  | RangePlotFields
  | DotPlotFields;
