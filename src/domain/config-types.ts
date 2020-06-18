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

const BarFields = t.intersection([
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
const BarConfig = t.type(
  {
    chartType: t.literal("bar"),
    filters: Filters,
    fields: BarFields,
  },
  "BarConfig"
);
export type BarFields = t.TypeOf<typeof BarFields>;
export type BarConfig = t.TypeOf<typeof BarConfig>;

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
const ColumnConfig = t.type(
  {
    chartType: t.literal("column"),
    filters: Filters,
    fields: ColumnFields,
  },
  "ColumnConfig"
);
export type ColumnFields = t.TypeOf<typeof ColumnFields>;
export type ColumnConfig = t.TypeOf<typeof ColumnConfig>;
