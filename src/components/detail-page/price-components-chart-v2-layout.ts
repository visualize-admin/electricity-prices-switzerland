import { extent, groups, max, scaleLinear } from "d3";

import { detailsPriceComponents, DetailPriceComponent } from "src/domain/data";
import { ObservationsWithAllPriceComponentsQuery } from "src/graphql/queries";

/** One operator × municipality row, with a value per price component */
export type PriceComponentsRow = {
  key: string;
  /** Entity the row is colored by (operator or municipality) */
  colorKey: string;
} & Partial<Record<DetailPriceComponent, number | null>>;

/** Operator observations as one row per operator × municipality */
export const toPriceComponentsRows = (
  observations: NonNullable<
    ObservationsWithAllPriceComponentsQuery["observations"]
  >,
  entity: "operator" | "municipality"
): PriceComponentsRow[] =>
  observations.map((obs) => ({
    key: `${obs.operator}:${obs.municipality}`,
    colorKey: obs[entity],
    ...Object.fromEntries(
      detailsPriceComponents.map((pc) => [pc, obs[pc] ?? null])
    ),
  }));

export type Segment = {
  colorKey: string;
  keys: string[];
  /** Lowest and highest value of the segment rows */
  values: [number, number];
  /** Pixel position of the segment, relative to the subplot top */
  y: number;
  height: number;
};

export type Bar = {
  id: string;
  priceComponent: DetailPriceComponent;
  /** Value range of the bin, in Rp./kWh */
  x0: number;
  x1: number;
  /** Lowest and highest value in the bin */
  values: [number, number];
  /** Pixel position of the bar, relative to the chart */
  x: number;
  width: number;
  count: number;
  segments: Segment[];
};

type Subplot = {
  priceComponent: DetailPriceComponent;
  /** Pixel offset of the plot area from the chart top */
  top: number;
  yMax: number;
  bars: Bar[];
};

export type PriceComponentsLayout = {
  width: number;
  height: number;
  margins: { top: number; right: number; bottom: number; left: number };
  plotHeight: number;
  /** Color keys of the rows, in the color domain order */
  colorDomain: string[];
  xTicks: { value: number; x: number }[];
  subplots: Subplot[];
};

const MARGINS = { top: 0, right: 16, bottom: 40, left: 40 };
/** Room for the subplot title above each plot */
const TITLE_HEIGHT = 28;
/** Room between plots for the connectors */
const GAP = 32;
const PLOT_HEIGHT = 64;
/** Values in the same bin of this width (Rp./kWh) are counted together */
const BIN_WIDTH = 0.1;

/**
 * Lays out one histogram per price component on a shared x scale, so bars of
 * different components can be compared in Rp./kWh.
 */
export const computePriceComponentsLayout = (
  rows: PriceComponentsRow[],
  { width, colorDomain }: { width: number; colorDomain: string[] }
): PriceComponentsLayout => {
  const priceComponents = detailsPriceComponents.filter((pc) =>
    rows.some((r) => r[pc] != null)
  );
  const maxValue =
    max(rows, (r) => max(priceComponents, (pc) => r[pc] ?? undefined)) ?? 1;
  const xScale = scaleLinear()
    .domain([0, maxValue])
    .range([MARGINS.left, width - MARGINS.right])
    .nice();
  const colorOrder = new Map(colorDomain.map((c, i) => [c, i]));

  const subplots = priceComponents.map((priceComponent, i) => {
    const top =
      MARGINS.top + i * (TITLE_HEIGHT + PLOT_HEIGHT + GAP) + TITLE_HEIGHT;
    // Rounding keeps float noise (22.2 / 0.1 = 221.99…) out of the bin index
    const bins = groups(
      rows.filter((r) => r[priceComponent] != null),
      (r) =>
        Math.floor(Math.round((r[priceComponent]! / BIN_WIDTH) * 1e6) / 1e6)
    ).sort(([a], [b]) => a - b);
    const yMax = max(bins, ([, binRows]) => binRows.length) ?? 1;
    const yScale = scaleLinear().domain([0, yMax]).range([PLOT_HEIGHT, 0]);

    const bars = bins.map(([index, binRows]): Bar => {
      const x0 = index * BIN_WIDTH;
      const x1 = x0 + BIN_WIDTH;
      let stacked = 0;
      const segments = groups(binRows, (r) => r.colorKey)
        .sort(
          ([a], [b]) =>
            (colorOrder.get(a) ?? Infinity) - (colorOrder.get(b) ?? Infinity)
        )
        .map(([colorKey, segmentRows]) => {
          const y = yScale(stacked + segmentRows.length);
          const height = yScale(stacked) - y;
          stacked += segmentRows.length;
          return {
            colorKey,
            keys: segmentRows.map((r) => r.key),
            values: extent(segmentRows, (r) => r[priceComponent]!) as [
              number,
              number
            ],
            y,
            height,
          };
        });
      // Bars stay visible when a bin is narrower than a few pixels
      const binWidth = xScale(x1) - xScale(x0);
      const barWidth = Math.max(2, binWidth - 1);
      return {
        id: `${priceComponent}-${index}`,
        priceComponent,
        x0,
        x1,
        values: extent(binRows, (r) => r[priceComponent]!) as [number, number],
        x: xScale(x0) + (binWidth - barWidth) / 2,
        width: barWidth,
        count: binRows.length,
        segments,
      };
    });

    return { priceComponent, top, yMax, bars };
  });

  const plotsBottom =
    MARGINS.top + subplots.length * (TITLE_HEIGHT + PLOT_HEIGHT + GAP) - GAP;

  return {
    width,
    height: plotsBottom + MARGINS.bottom,
    margins: MARGINS,
    plotHeight: PLOT_HEIGHT,
    colorDomain: colorDomain.filter((c) => rows.some((r) => r.colorKey === c)),
    xTicks: xScale.ticks(Math.max(2, Math.floor(width / 80))).map((value) => ({
      value,
      x: xScale(value),
    })),
    subplots,
  };
};

/**
 * The target closest to the pointer, like a voronoi of rectangles: thin bars
 * and small nodes stay easy to hover, and gaps between them do not drop it.
 */
export const findNearest = <T extends Rect>(
  targets: T[],
  x: number,
  y: number,
  maxDistance = 24
) => {
  let nearest: T | undefined;
  let nearestDistance = maxDistance;
  for (const target of targets) {
    const dx = Math.max(0, target.x - x, x - (target.x + target.width));
    const dy = Math.max(0, target.y - y, y - (target.y + target.height));
    const distance = Math.hypot(dx, dy);
    if (distance <= nearestDistance) {
      nearest = target;
      nearestDistance = distance;
    }
  }
  return nearest;
};

type Connector = {
  /** Number of hovered rows going through both bars */
  count: number;
  path: string;
};

type Highlight = {
  /** Number of hovered rows per segment, keyed by bar id and color key */
  matches: Map<string, Map<string, number>>;
  connectors: Connector[];
};

/**
 * Follows the hovered rows through every price component: how many of them
 * fall in each bar, and the links between bars of adjacent subplots.
 */
export const computeHighlight = (
  layout: PriceComponentsLayout,
  hoveredKeys: ReadonlySet<string>
): Highlight => {
  const matches = new Map<string, Map<string, number>>();
  const barOfKey = layout.subplots.map(() => new Map<string, Bar>());

  layout.subplots.forEach((subplot, i) => {
    for (const bar of subplot.bars) {
      for (const segment of bar.segments) {
        const matched = segment.keys.filter((k) => hoveredKeys.has(k));
        if (matched.length === 0) {
          continue;
        }
        if (!matches.has(bar.id)) {
          matches.set(bar.id, new Map());
        }
        matches.get(bar.id)!.set(segment.colorKey, matched.length);
        matched.forEach((k) => barOfKey[i].set(k, bar));
      }
    }
  });

  const connectors = layout.subplots.slice(0, -1).flatMap((subplot, i) => {
    const next = layout.subplots[i + 1];
    const links = groups(
      [...hoveredKeys].filter(
        (k) => barOfKey[i].has(k) && barOfKey[i + 1].has(k)
      ),
      (k) => barOfKey[i].get(k)!,
      (k) => barOfKey[i + 1].get(k)!
    );
    return links.flatMap(([from, tos]) =>
      tos.map(([to, keys]) => {
        const x1 = from.x + from.width / 2;
        const y1 = subplot.top + layout.plotHeight;
        const x2 = to.x + to.width / 2;
        // Ends on top of the bar, the first segment is the bottom one
        const y2 = next.top + to.segments[to.segments.length - 1].y;
        const yMid = (y1 + y2) / 2;
        return {
          count: keys.length,
          path: `M${x1},${y1} C${x1},${yMid} ${x2},${yMid} ${x2},${y2}`,
        };
      })
    );
  });

  return { matches, connectors };
};

export type Rect = { x: number; y: number; width: number; height: number };

/** Id of a segment, the same in the histogram and the sankey */
export const segmentId = (bar: Bar, segment: Segment) =>
  `${bar.id}|${segment.colorKey}`;

/** Position of every histogram segment, relative to the chart */
export const histogramRects = (layout: PriceComponentsLayout) =>
  new Map(
    layout.subplots.flatMap((subplot) =>
      subplot.bars.flatMap((bar) =>
        bar.segments.map((segment) => [
          segmentId(bar, segment),
          {
            x: bar.x,
            y: subplot.top + segment.y,
            width: bar.width,
            height: segment.height,
          },
        ])
      )
    )
  );

/** A node holds the rows of one color key, its bar has a single segment */
type SankeyNode = Rect & { bar: Bar };

export type SankeyLink = {
  from: Bar;
  to: Bar;
  keys: string[];
  /** Number of rows per color key */
  counts: { colorKey: string; count: number }[];
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  thickness: number;
};

type SankeyLayout = {
  width: number;
  height: number;
  /** Pixels per row, links and nodes share it */
  rowHeight: number;
  columns: { priceComponent: DetailPriceComponent; x: number }[];
  /** One sankey per color key, with the label position */
  bands: { colorKey: string; labelY: number }[];
  nodes: SankeyNode[];
  rects: Map<string, Rect>;
  links: SankeyLink[];
};

/** The right margin fits the labels of the last column */
const SANKEY_MARGINS = { top: 40, right: 136, bottom: 8, left: 8 };
/** Column order, the total adds up the price components before it */
const SANKEY_STAGES: DetailPriceComponent[] = [
  "gridusage",
  "energy",
  "meteringrate",
  "aidfee",
  "charge",
  "total",
];
const NODE_WIDTH = 12;
const NODE_PADDING = 4;
/** Room above each sankey for its label */
const BAND_LABEL_HEIGHT = 28;

/**
 * Lays the histogram segments out as one sankey per color key (operator),
 * stacked, sharing the columns: one column per price component, the total
 * last, and links carrying the rows from one column to the next. Node
 * heights follow the number of rows, on the same scale in every sankey.
 */
export const computeSankeyLayout = (
  layout: PriceComponentsLayout,
  { height }: { height: number }
): SankeyLayout => {
  const { width } = layout;
  const stages = SANKEY_STAGES.flatMap((pc) =>
    layout.subplots.filter((s) => s.priceComponent === pc)
  );
  const step =
    (width - SANKEY_MARGINS.left - SANKEY_MARGINS.right - NODE_WIDTH) /
    Math.max(1, stages.length - 1);
  const columns = stages.map((stage, i) => ({
    priceComponent: stage.priceComponent,
    x: SANKEY_MARGINS.left + i * step,
  }));

  // Nodes of each sankey per column, highest price on top
  const bandColumns = layout.colorDomain.map((colorKey) => ({
    colorKey,
    columns: stages.map((stage) =>
      stage.bars
        .flatMap((bar) => {
          const segment = bar.segments.find((s) => s.colorKey === colorKey);
          return segment
            ? [
                {
                  ...bar,
                  id: segmentId(bar, segment),
                  values: segment.values,
                  count: segment.keys.length,
                  segments: [segment],
                },
              ]
            : [];
        })
        .reverse()
    ),
  }));
  // The column with the most nodes sets the height of each sankey
  const sizes = bandColumns.map(({ columns }) => ({
    count:
      max(columns, (bars) => bars.reduce((sum, b) => sum + b.count, 0)) ?? 0,
    padding: NODE_PADDING * ((max(columns, (bars) => bars.length) ?? 1) - 1),
  }));
  const available =
    height -
    SANKEY_MARGINS.top -
    SANKEY_MARGINS.bottom -
    BAND_LABEL_HEIGHT * bandColumns.length;
  const rowHeight =
    (available - sizes.reduce((sum, s) => sum + s.padding, 0)) /
    Math.max(
      1,
      sizes.reduce((sum, s) => sum + s.count, 0)
    );

  const nodeOfKey = stages.map(() => new Map<string, SankeyNode>());
  const colorOfKey = new Map<string, string>();
  const nodes: SankeyNode[] = [];
  const rects = new Map<string, Rect>();
  let bandTop = SANKEY_MARGINS.top;
  const bands = bandColumns.map(({ colorKey, columns: bandBars }, b) => {
    const labelY = bandTop;
    const top = bandTop + BAND_LABEL_HEIGHT;
    const bandHeight = sizes[b].count * rowHeight + sizes[b].padding;
    bandBars.forEach((bars, i) => {
      const count = bars.reduce((sum, bar) => sum + bar.count, 0);
      const columnHeight = count * rowHeight + NODE_PADDING * (bars.length - 1);
      let y = top + (bandHeight - columnHeight) / 2;
      for (const bar of bars) {
        const node = {
          bar,
          x: columns[i].x,
          y,
          width: NODE_WIDTH,
          height: bar.count * rowHeight,
        };
        nodes.push(node);
        rects.set(bar.id, node);
        bar.segments[0].keys.forEach((k) => {
          nodeOfKey[i].set(k, node);
          colorOfKey.set(k, colorKey);
        });
        y += node.height + NODE_PADDING;
      }
    });
    bandTop = top + bandHeight;
    return { colorKey, labelY };
  });

  const links = stages.slice(0, -1).flatMap((_, i) => {
    const pairs = groups(
      [...nodeOfKey[i].keys()].filter((k) => nodeOfKey[i + 1].has(k)),
      (k) => nodeOfKey[i].get(k)!,
      (k) => nodeOfKey[i + 1].get(k)!
    ).flatMap(([from, tos]) => tos.map(([to, keys]) => ({ from, to, keys })));
    // Links leave and enter nodes in the order of the nodes they connect
    const outOffset = new Map<SankeyNode, number>();
    const inOffset = new Map<SankeyNode, number>();
    return pairs
      .sort((a, b) => a.from.y - b.from.y || a.to.y - b.to.y)
      .map((link) => {
        const thickness = link.keys.length * rowHeight;
        const y0 = link.from.y + (outOffset.get(link.from) ?? 0);
        outOffset.set(link.from, (outOffset.get(link.from) ?? 0) + thickness);
        return { ...link, thickness, y0 };
      })
      .sort((a, b) => a.to.y - b.to.y || a.from.y - b.from.y)
      .map(({ from, to, keys, thickness, y0 }) => {
        const y1 = to.y + (inOffset.get(to) ?? 0);
        inOffset.set(to, (inOffset.get(to) ?? 0) + thickness);
        return {
          from: from.bar,
          to: to.bar,
          keys,
          counts: groups(keys, (k) => colorOfKey.get(k)!).map(
            ([colorKey, ks]) => ({ colorKey, count: ks.length })
          ),
          x0: from.x + NODE_WIDTH,
          y0,
          x1: to.x,
          y1,
          thickness,
        };
      });
  });

  return {
    width,
    height: bandTop + SANKEY_MARGINS.bottom,
    rowHeight,
    columns,
    bands,
    nodes,
    rects,
    links,
  };
};

/** The link as a horizontal band, or its top part for a smaller thickness */
export const bandPath = ({ x0, y0, x1, y1 }: SankeyLink, thickness: number) => {
  const xm = (x0 + x1) / 2;
  return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1} L${x1},${
    y1 + thickness
  } C${xm},${y1 + thickness} ${xm},${y0 + thickness} ${x0},${y0 + thickness} Z`;
};
