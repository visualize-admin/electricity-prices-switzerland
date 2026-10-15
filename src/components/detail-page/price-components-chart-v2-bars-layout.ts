import { groups, max, scaleLinear } from "d3";

import {
  PriceComponentsLayout,
  PriceComponentsRow,
  Rect,
  segmentId,
} from "src/components/detail-page/price-components-chart-v2-layout";
import { DetailPriceComponent } from "src/domain/data";

/**
 * Stack order of the price components. The charges to the community vary the
 * most between municipalities, last they leave the other segments aligned.
 */
export const BAR_COMPONENTS: DetailPriceComponent[] = [
  "gridusage",
  "energy",
  "meteringrate",
  "aidfee",
  "charge",
];

type ProfileSegment = Rect & {
  priceComponent: DetailPriceComponent;
  value: number;
  /** Id of the sankey node the segment comes from in the transition */
  sourceId: string;
};

/** Rows of one color key with the same price components, as one bar */
export type Profile = Rect & {
  id: string;
  colorKey: string;
  keys: string[];
  total: number;
  segments: ProfileSegment[];
  /** Count bar, growing leftward with the number of rows */
  countBar: Rect;
};

type BarsLayout = {
  width: number;
  height: number;
  /** Right end of the count bars, where the price bars start */
  countRight: number;
  priceLeft: number;
  barHeight: number;
  xTicks: { value: number; x: number }[];
  profiles: Profile[];
};

const MARGINS = { top: 40, right: 56, bottom: 40, left: 8 };
const COUNT_WIDTH = 96;
/** Room left of the count bars for their label */
const COUNT_LABEL_WIDTH = 32;
const BAR_HEIGHT = 14;
const BAR_PADDING = 6;

/**
 * Lays out one stacked bar per price profile: the rows of a color key that
 * share every price component. Bars are sorted by total, highest on top, on
 * a shared Rp./kWh scale, with the number of rows as a histogram on the left.
 */
export const computeBarsLayout = (
  rows: PriceComponentsRow[],
  layout: PriceComponentsLayout
): BarsLayout => {
  const { width } = layout;
  // The sankey node of every row, per price component
  const nodeOf = new Map<string, string>();
  for (const subplot of layout.subplots) {
    for (const bar of subplot.bars) {
      for (const segment of bar.segments) {
        for (const key of segment.keys) {
          nodeOf.set(
            `${subplot.priceComponent}:${key}`,
            segmentId(bar, segment)
          );
        }
      }
    }
  }

  const colorOrder = new Map(layout.colorDomain.map((c, i) => [c, i]));
  const profileRows = groups(rows, (r) =>
    [r.colorKey, ...BAR_COMPONENTS.map((pc) => r[pc])].join("|")
  )
    .map(([id, profileRows]) => ({ id, rows: profileRows }))
    .sort(
      (a, b) =>
        (b.rows[0].total ?? 0) - (a.rows[0].total ?? 0) ||
        (colorOrder.get(a.rows[0].colorKey) ?? 0) -
          (colorOrder.get(b.rows[0].colorKey) ?? 0)
    );

  const countRight = MARGINS.left + COUNT_WIDTH;
  const priceLeft = countRight + 8;
  const countScale = scaleLinear()
    .domain([0, max(profileRows, (p) => p.rows.length) ?? 1])
    .range([0, COUNT_WIDTH - COUNT_LABEL_WIDTH]);
  const priceScale = scaleLinear()
    .domain([0, max(profileRows, (p) => p.rows[0].total ?? 0) ?? 1])
    .range([priceLeft, width - MARGINS.right])
    .nice();

  const profiles = profileRows.map(({ id, rows: profileRows }, i): Profile => {
    const first = profileRows[0];
    const y = MARGINS.top + i * (BAR_HEIGHT + BAR_PADDING);
    let x = priceScale(0);
    const segments = BAR_COMPONENTS.flatMap((priceComponent) => {
      const value = first[priceComponent];
      if (value == null) {
        return [];
      }
      const segmentWidth = priceScale(value) - priceScale(0);
      const segment = {
        priceComponent,
        value,
        sourceId: nodeOf.get(`${priceComponent}:${first.key}`)!,
        x,
        y,
        width: segmentWidth,
        height: BAR_HEIGHT,
      };
      x += segmentWidth;
      return [segment];
    });
    const countWidth = countScale(profileRows.length);
    return {
      id,
      colorKey: first.colorKey,
      keys: profileRows.map((r) => r.key),
      total: first.total ?? x,
      segments,
      countBar: {
        x: countRight - countWidth,
        y,
        width: countWidth,
        height: BAR_HEIGHT,
      },
      // The whole row hovers, from the count bar to the total label
      x: MARGINS.left,
      y: y - BAR_PADDING / 2,
      width: width - MARGINS.left,
      height: BAR_HEIGHT + BAR_PADDING,
    };
  });

  return {
    width,
    height:
      MARGINS.top +
      profiles.length * (BAR_HEIGHT + BAR_PADDING) +
      MARGINS.bottom,
    countRight,
    priceLeft,
    barHeight: BAR_HEIGHT,
    xTicks: priceScale
      .ticks(Math.max(2, Math.floor((width - priceLeft) / 80)))
      .map((value) => ({ value, x: priceScale(value) })),
    profiles,
  };
};
