import { z } from "zod";

const SortingOrder = z.union([z.literal("asc"), z.literal("desc")]);
export type SortingOrder = z.infer<typeof SortingOrder>;

const SortingType = z.union([
  z.literal("byDimensionLabel"),
  z.literal("byMeasure"),
  z.literal("byTotalSize"),
]);
export type SortingType = z.infer<typeof SortingType>;

const ColorMapping = z.record(z.string(), z.string());
type ColorMapping = z.infer<typeof ColorMapping>;

const GenericField = z.object({ componentIri: z.string() });
type GenericField = z.infer<typeof GenericField>;

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
    })
    .optional(),
});

type SegmentField = z.infer<typeof SegmentField>;

const BarFields = z.object({
  x: z.object({
    componentIri: z.string(),
    domain: z.array(z.number()),
  }),
  y: z.object({
    componentIri: z.string(),
    sorting: z
      .object({
        sortingType: SortingType,
        sortingOrder: SortingOrder,
      })
      .optional(),
  }),
  height: GenericField.optional(),
  segment: SegmentField.optional(),
  label: GenericField.optional(),
  style: z
    .object({
      colorDomain: z.array(z.string()),
      opacityDomain: z.array(z.string()),
      colorAcc: z.string(),
      opacityAcc: z.string(),
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
  x: GenericField,
  y: GenericField,
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

const ScatterPlotFields = z.object({
  x: GenericField,
  y: GenericField,
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

export type ScatterPlotFields = z.infer<typeof ScatterPlotFields>;

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
});
export type HistogramFields = z.infer<typeof HistogramFields>;

const RangePlotFields = z.object({
  x: GenericField,
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
  | ScatterPlotFields;
