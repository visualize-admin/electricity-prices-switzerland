import * as t from "io-ts";

// Chart Config
const SortingOrder = t.union([t.literal("asc"), t.literal("desc")]);
export type SortingOrder = t.TypeOf<typeof SortingOrder>;

const SortingType = t.union([
  t.literal("byDimensionLabel"),
  t.literal("byMeasure"),
  t.literal("byTotalSize"),
]);
export type SortingType = t.TypeOf<typeof SortingType>;

const ColorMapping = t.record(t.string, t.string);
export type ColorMapping = t.TypeOf<typeof ColorMapping>;

const GenericField = t.type({ componentIri: t.string });
export type GenericField = t.TypeOf<typeof GenericField>;

export type GenericFields = Record<string, GenericField | undefined>;

const Observation = t.record(
  t.string,
  t.union([t.string, t.number, t.boolean])
);

const SegmentField = t.intersection([
  t.type({
    componentIri: t.string,
  }),
  t.type({
    type: t.union([t.literal("stacked"), t.literal("grouped")]),
  }),
  t.type({ palette: t.string }),
  t.partial({
    colorMapping: ColorMapping,
  }),
  t.partial({
    sorting: t.type({
      sortingType: SortingType,
      sortingOrder: SortingOrder,
    }),
  }),
]);

export type SegmentField = t.TypeOf<typeof SegmentField>;
export type SegmentFields = Record<string, SegmentField | undefined>;

// ----

const BarFields = t.intersection([
  t.type({
    x: t.type({
      componentIri: t.string,
      domain: t.array(t.number),
    }),
    y: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.partial({
        sorting: t.type({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
  }),
  t.partial({
    height: GenericField,
  }),
  t.partial({
    segment: SegmentField,
  }),
  t.partial({
    label: GenericField,
  }),
  t.partial({
    style: t.type({
      colorDomain: t.array(t.string),
      opacityDomain: t.array(t.string),
      colorAcc: t.string,
      opacityAcc: t.string,
    }),
  }),
]);
export type BarFields = t.TypeOf<typeof BarFields>;

const ColumnFields = t.intersection([
  t.type({
    x: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.partial({
        sorting: t.type({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
    y: GenericField,
  }),
  t.partial({
    segment: SegmentField,
  }),
]);
export type ColumnFields = t.TypeOf<typeof ColumnFields>;

const LineFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.type({ palette: t.string }),
      t.partial({
        colorMapping: ColorMapping,
      }),
    ]),
  }),
  t.partial({
    style: t.type({
      entity: t.string,
      colorDomain: t.array(t.string),
      colorAcc: t.string,
    }),
  }),
]);

export type LineFields = t.TypeOf<typeof LineFields>;

const AreaFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),

  t.partial({
    segment: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.type({ palette: t.string }),
      t.partial({
        colorMapping: ColorMapping,
      }),
      t.partial({
        sorting: t.type({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
  }),
]);

export type AreaFields = t.TypeOf<typeof AreaFields>;

const HistogramFields = t.intersection([
  t.type({
    x: GenericField,
    // FIXME: Add a diverging color palette. t.type({ palette: t.string }),
    label: GenericField,
  }),
  t.partial({
    segment: SegmentField,
  }),
  t.partial({ annotation: t.array(Observation) }),
]);
export type HistogramFields = t.TypeOf<typeof HistogramFields>;

const RangePlotFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
    label: GenericField, // FIXME: Should label be part of "annotation" below?
  }),
  t.partial({ annotation: t.array(Observation) }),
]);

export type RangePlotFields = t.TypeOf<typeof RangePlotFields>;

export type ChartFields =
  | ColumnFields
  | BarFields
  | AreaFields
  | LineFields
  | HistogramFields
  | RangePlotFields;
