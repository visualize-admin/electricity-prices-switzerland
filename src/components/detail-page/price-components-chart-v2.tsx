import { useLingui } from "@lingui/react";
import { Box, Typography } from "@mui/material";
import {
  color as d3Color,
  easeCubicInOut,
  format,
  interpolateLab,
  interpolateRgb,
  pointer,
  scaleOrdinal,
  timer,
} from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

import { ButtonGroup } from "src/components/button-group";
import { LegendItem } from "src/components/charts-generic/legends/color";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import {
  BAR_COMPONENTS,
  computeBarsLayout,
  Profile,
} from "src/components/detail-page/price-components-chart-v2-bars-layout";
import {
  Bar,
  bandPath,
  computeHighlight,
  computePriceComponentsLayout,
  computeSankeyLayout,
  findNearest,
  histogramRects,
  PriceComponentsRow,
  Rect,
  SankeyLink,
  segmentId,
} from "src/components/detail-page/price-components-chart-v2-layout";
import { DetailPriceComponent } from "src/domain/data";
import { getPalette } from "src/domain/helpers";
import { RP_PER_KWH } from "src/domain/metrics";
import { getLocalizedLabel } from "src/domain/translation";
import { useResizeObserver } from "src/lib/use-resize-observer";
import { palette } from "src/themes/palette";

type View = "histogram" | "sankey" | "bars";

/** A histogram bar or sankey node, a sankey link or a price profile */
type Hovered = Bar | SankeyLink | Profile;

const isProfile = (hovered: Hovered): hovered is Profile => "total" in hovered;
const isBar = (hovered: Hovered): hovered is Bar =>
  !isProfile(hovered) && "segments" in hovered;

const hoveredKeysOf = (hovered: Hovered) =>
  new Set(
    isBar(hovered) ? hovered.segments.flatMap((s) => s.keys) : hovered.keys
  );

/** Shades of the operator color, darkest for the first price component */
const shades = (base: string) => {
  const c = d3Color(base)!;
  const interpolate = interpolateLab(c.darker(0.7), c.brighter(1));
  return BAR_COMPONENTS.map((_, i) =>
    interpolate(i / (BAR_COMPONENTS.length - 1))
  );
};

const SANKEY_HEIGHT = 520;
const TRANSITION_MS = 900;

/**
 * LegendItem has a wide right margin, legends here space items with a gap.
 * The doubled selector wins over the LegendItem class.
 */
const tightLegend = { "&& > *": { marginRight: 0 } };

/**
 * Mutes a color by mixing it with white. Muted marks stay solid, grid lines
 * behind them do not show through like with opacity.
 */
const mute = (color: string) => interpolateRgb(color, "white")(0.7);

const formatCount = (count: number) =>
  count === 1 ? "1 municipality" : `${count} municipalities`;

/** Nodes shorter than this only get their value, not their count */
const TWO_LINE_LABEL_HEIGHT = 26;
/** A bit smaller than axis labels, nodes carry two lines */
const SANKEY_LABEL_FONT_SIZE = 11;

const formatBin = format(".1f");
const formatValue = format(".2f");
const formatValues = ({ values: [low, high] }: Bar) =>
  low === high ? formatValue(low) : `${formatValue(low)}–${formatValue(high)}`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  width: lerp(a.width, b.width, t),
  height: lerp(a.height, b.height, t),
});

type ViewTransition = { from: View; to: View; t: number };

/** Animates from the previous view to the new one, t going from 0 to 1 */
const useViewTransition = (view: View) => {
  const [transition, setTransition] = useState<ViewTransition>({
    from: view,
    to: view,
    t: 1,
  });
  const transitionRef = useRef(transition);
  useEffect(() => {
    const current = transitionRef.current;
    if (current.to === view) {
      return;
    }
    // Turning back mid-way reverses from where the marks are
    const start = current.from === view ? 1 - current.t : 0;
    const from = current.to;
    const duration = TRANSITION_MS * (1 - start);
    const t = timer((elapsed) => {
      const done = elapsed >= duration;
      transitionRef.current = {
        from,
        to: view,
        t: done ? 1 : lerp(start, 1, easeCubicInOut(elapsed / duration)),
      };
      setTransition(transitionRef.current);
      if (done) {
        t.stop();
      }
    });
    return () => t.stop();
  }, [view]);
  return transition;
};

/**
 * Price components of many municipalities, as one histogram per price
 * component on a shared Rp./kWh scale, or as a sankey showing how the
 * municipalities regroup from one price component to the next, or as one
 * stacked bar per price profile. Hovering a bar follows its municipalities
 * through the other price components.
 */
export const PriceComponentsChartV2 = ({
  rows,
  colorDomain,
  colorLabels,
}: {
  rows: PriceComponentsRow[];
  /** Same order as the bars chart, so the entity colors match */
  colorDomain: string[];
  colorLabels: Map<string, string>;
}) => {
  const { i18n } = useLingui();
  const theme = useChartTheme();
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>("histogram");
  const [hovered, setHovered] = useState<Hovered>();
  /** Price component under the pointer, in the bars */
  const [hoveredComponent, setHoveredComponent] =
    useState<DetailPriceComponent>();
  const { from, to, t } = useViewTransition(view);
  /** How much a view shows, 1 when it is the settled view */
  const weight = (v: View) =>
    (to === v ? t : 0) + (from === v && from !== to ? 1 - t : 0);
  /** Interactions only run once a transition is over */
  const settled = t === 1 ? to : undefined;

  const colors = scaleOrdinal<string, string>()
    .domain(colorDomain)
    .range(getPalette("elcom"));

  const layout = useMemo(
    () => computePriceComponentsLayout(rows, { width, colorDomain }),
    [rows, width, colorDomain]
  );
  const histogram = useMemo(() => histogramRects(layout), [layout]);
  const sankey = useMemo(
    () => computeSankeyLayout(layout, { height: SANKEY_HEIGHT }),
    [layout]
  );
  const bars = useMemo(() => computeBarsLayout(rows, layout), [rows, layout]);
  const hoveredKeys = useMemo(
    () => (hovered ? hoveredKeysOf(hovered) : undefined),
    [hovered]
  );
  const highlight = useMemo(
    () => (hoveredKeys ? computeHighlight(layout, hoveredKeys) : undefined),
    [layout, hoveredKeys]
  );
  const { margins, plotHeight } = layout;
  // Histogram bars hover over the whole plot height, they are short
  const histogramTargets = useMemo(
    () =>
      layout.subplots.flatMap((subplot) =>
        subplot.bars.map((bar) => ({
          bar,
          x: bar.x,
          y: subplot.top,
          width: bar.width,
          height: layout.plotHeight,
        }))
      ),
    [layout]
  );
  const findHovered = (
    x: number,
    y: number,
    target: EventTarget
  ): Hovered | undefined => {
    if (settled === "histogram") {
      return findNearest(histogramTargets, x, y)?.bar;
    }
    if (settled === "bars") {
      return findNearest(bars.profiles, x, y, 0);
    }
    if (settled !== "sankey") {
      return undefined;
    }
    // Nodes win near their edges, where links touch them
    const linkIndex = (target as Element).getAttribute("data-link");
    return (
      findNearest(sankey.nodes, x, y, 6)?.bar ??
      (linkIndex ? sankey.links[Number(linkIndex)] : undefined) ??
      findNearest(sankey.nodes, x, y)?.bar
    );
  };
  const heights = {
    histogram: layout.height,
    sankey: sankey.height,
    bars: bars.height,
  };
  const height = lerp(heights[from], heights[to], t);
  const histogramOpacity = weight("histogram");
  const sankeyOpacity = weight("sankey");
  const barsOpacity = weight("bars");
  // Histogram bars and sankey nodes share their ids, bar segments come from
  // whichever of the two the transition starts or ends on
  const segmentRects: Partial<Record<View, Map<string, Rect>>> = {
    histogram,
    sankey: sankey.rects,
  };
  const segmentsFrom = segmentRects[from] ?? segmentRects[to] ?? histogram;
  const segmentsTo = segmentRects[to] ?? segmentsFrom;
  const tooltipAnchor = (() => {
    if (!hovered) {
      return undefined;
    }
    if (isProfile(hovered)) {
      // Bars span most of the width, the tooltip goes by the bar end
      const last = hovered.segments[hovered.segments.length - 1];
      const end = last.x + last.width;
      return { left: end, right: end, y: last.y + last.height + 4 };
    }
    if (!isBar(hovered)) {
      const x = (hovered.x0 + hovered.x1) / 2;
      const y = (hovered.y0 + hovered.y1) / 2 + hovered.thickness / 2;
      return { left: x, right: x, y };
    }
    if (settled === "histogram") {
      const subplot = layout.subplots.find(
        (s) => s.priceComponent === hovered.priceComponent
      )!;
      return {
        left: hovered.x,
        right: hovered.x + hovered.width,
        y: subplot.top,
      };
    }
    const node = sankey.nodes.find((n) => n.bar === hovered)!;
    return { left: node.x, right: node.x + node.width, y: node.y };
  })();

  return (
    <div>
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        mb={4}
      >
        <Box display="flex" flexWrap="wrap" columnGap={4} sx={tightLegend}>
          {colorDomain.map((colorKey) => (
            <LegendItem
              key={colorKey}
              item={colorLabels.get(colorKey) ?? colorKey}
              color={colors(colorKey)}
              symbol="square"
            />
          ))}
        </Box>
        <ButtonGroup<View>
          id="price-components-chart-v2-view"
          fitLabelToContent
          options={[
            { value: "histogram", label: "Histogram" },
            { value: "sankey", label: "Sankey" },
            { value: "bars", label: "Bars" },
          ]}
          value={view}
          setValue={(view) => {
            setHovered(undefined);
            setView(view);
          }}
        />
      </Box>
      <div ref={resizeRef} style={{ position: "relative" }}>
        {width > 1 && (
          <svg
            ref={svgRef}
            width={layout.width}
            height={height}
            onMouseMove={(e) => {
              const [x, y] = pointer(e);
              const next = findHovered(x, y, e.target);
              setHovered(next);
              setHoveredComponent(
                next && isProfile(next)
                  ? next.segments.find((s) => x >= s.x && x < s.x + s.width)
                      ?.priceComponent
                  : undefined
              );
            }}
            onMouseLeave={() => setHovered(undefined)}
            style={{ fontFamily: theme.fontFamily, display: "block" }}
          >
            {histogramOpacity > 0 && (
              <g opacity={histogramOpacity}>
                {layout.xTicks.map(({ value, x }) => (
                  <g key={value} transform={`translate(${x},0)`}>
                    <line
                      y2={layout.height - margins.bottom}
                      stroke={theme.gridColor}
                    />
                    <text
                      y={layout.height - margins.bottom + 16}
                      textAnchor="middle"
                      fontSize={theme.labelFontSize}
                      fill={theme.labelColor}
                    >
                      {value}
                    </text>
                  </g>
                ))}
                <text
                  x={layout.width - margins.right}
                  y={layout.height - 4}
                  textAnchor="end"
                  fontSize={theme.labelFontSize}
                  fill={theme.labelColor}
                >
                  {i18n._(RP_PER_KWH)}
                </text>
                {layout.subplots.map((subplot) => (
                  <g
                    key={subplot.priceComponent}
                    transform={`translate(0,${subplot.top})`}
                  >
                    <text
                      x={margins.left}
                      y={-10}
                      fontSize={14}
                      fontWeight={700}
                      fill={theme.axisLabelColor}
                    >
                      {getLocalizedLabel({ id: subplot.priceComponent })}
                    </text>
                    <text
                      x={margins.left - 6}
                      y={4}
                      textAnchor="end"
                      fontSize={theme.labelFontSize}
                      fill={theme.labelColor}
                    >
                      {subplot.yMax}
                    </text>
                    <line
                      x1={margins.left}
                      x2={layout.width - margins.right}
                      y1={plotHeight}
                      y2={plotHeight}
                      stroke={theme.domainColor}
                    />
                  </g>
                ))}
              </g>
            )}

            {sankeyOpacity > 0 && (
              <g opacity={sankeyOpacity}>
                {sankey.links.map((link, i) => {
                  // The hovered rows take the top of each link
                  const matched = hoveredKeys
                    ? link.keys.filter((k) => hoveredKeys.has(k)).length
                    : 0;
                  return (
                    <g key={i}>
                      <path
                        d={bandPath(link, link.thickness)}
                        data-link={i}
                        fill={palette.monochrome[400]}
                        fillOpacity={hovered ? 0.15 : 0.35}
                        pointerEvents={
                          settled === "sankey" ? undefined : "none"
                        }
                      />
                      {matched > 0 && (
                        <path
                          d={bandPath(link, matched * sankey.rowHeight)}
                          fill={palette.monochrome[500]}
                          fillOpacity={0.6}
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {settled === "histogram" &&
              highlight?.connectors.map((connector, i) => (
                <path
                  key={i}
                  d={connector.path}
                  fill="none"
                  stroke={palette.monochrome[400]}
                  strokeOpacity={0.6}
                  strokeWidth={Math.min(6, 1 + Math.sqrt(connector.count))}
                  pointerEvents="none"
                />
              ))}

            {histogramOpacity + sankeyOpacity > 0 && (
              <g opacity={histogramOpacity + sankeyOpacity}>
                {layout.subplots.flatMap((subplot) =>
                  subplot.bars.flatMap((bar) =>
                    bar.segments.map((segment) => {
                      const id = segmentId(bar, segment);
                      const rect = lerpRect(
                        segmentsFrom.get(id)!,
                        segmentsTo.get(id)!,
                        t
                      );
                      const matched = highlight?.matches
                        .get(bar.id)
                        ?.get(segment.colorKey);
                      // Sankey nodes reorder rows between their links, a partial
                      // fill would point at the wrong rows: they light up whole
                      const matchedHeight = !matched
                        ? 0
                        : settled === "sankey"
                        ? rect.height
                        : (rect.height * matched) / segment.keys.length;
                      const matchedRect = matchedHeight > 0 && {
                        ...rect,
                        y: rect.y + rect.height - matchedHeight,
                        height: matchedHeight,
                      };
                      return (
                        <g key={id} pointerEvents="none">
                          <rect
                            {...rect}
                            fill={
                              highlight
                                ? mute(colors(segment.colorKey))
                                : colors(segment.colorKey)
                            }
                          />
                          {matchedRect && matchedRect.height > 0 && (
                            <rect
                              {...matchedRect}
                              fill={colors(segment.colorKey)}
                            />
                          )}
                        </g>
                      );
                    })
                  )
                )}
              </g>
            )}

            {sankeyOpacity > 0 && (
              <g opacity={sankeyOpacity} pointerEvents="none">
                {sankey.nodes
                  .filter((node) => node.height >= 12)
                  .map((node) => {
                    const x = node.x + node.width + 4;
                    const value = `${formatValues(node.bar)} ${i18n._(
                      RP_PER_KWH
                    )}`;
                    return (
                      <text
                        key={node.bar.id}
                        x={x}
                        y={node.y + node.height / 2}
                        fontSize={SANKEY_LABEL_FONT_SIZE}
                        fill={theme.labelColor}
                        stroke={palette.background.paper}
                        strokeWidth={3}
                        paintOrder="stroke"
                      >
                        {node.height >= TWO_LINE_LABEL_HEIGHT ? (
                          <>
                            <tspan x={x} dy="-0.25em">
                              {formatCount(node.bar.count)}
                            </tspan>
                            <tspan x={x} dy="1.2em">
                              {value}
                            </tspan>
                          </>
                        ) : (
                          <tspan dy="0.35em">{value}</tspan>
                        )}
                      </text>
                    );
                  })}
              </g>
            )}

            {barsOpacity > 0 && (
              <g pointerEvents="none">
                <g opacity={barsOpacity}>
                  {bars.xTicks.map(({ value, x }) => (
                    <g key={value} transform={`translate(${x},0)`}>
                      <line
                        y1={bars.profiles[0]?.y ?? 0}
                        y2={bars.height - 32}
                        stroke={theme.gridColor}
                      />
                      <text
                        y={bars.height - 16}
                        textAnchor="middle"
                        fontSize={theme.labelFontSize}
                        fill={theme.labelColor}
                      >
                        {value}
                      </text>
                    </g>
                  ))}
                  <text
                    x={layout.width - 8}
                    y={bars.height - 2}
                    textAnchor="end"
                    fontSize={theme.labelFontSize}
                    fill={theme.labelColor}
                  >
                    {i18n._(RP_PER_KWH)}
                  </text>
                  <text
                    x={bars.countRight}
                    y={bars.height - 16}
                    textAnchor="end"
                    fontSize={theme.labelFontSize}
                    fill={theme.labelColor}
                  >
                    {getLocalizedLabel({ id: "municipalities" })}
                  </text>
                </g>
                {bars.profiles.map((profile) => {
                  const profileShades = shades(colors(profile.colorKey));
                  const muted =
                    settled === "bars" && hovered && hovered !== profile;
                  const maybeMute = (color: string) =>
                    muted ? mute(color) : color;
                  return (
                    <g key={profile.id}>
                      <g opacity={barsOpacity}>
                        <rect
                          {...profile.countBar}
                          fill={maybeMute(palette.monochrome[300])}
                        />
                        <text
                          x={profile.countBar.x - 4}
                          y={profile.countBar.y + bars.barHeight / 2}
                          dy="0.35em"
                          textAnchor="end"
                          fontSize={theme.labelFontSize}
                          fill={maybeMute(theme.labelColor)}
                        >
                          {profile.keys.length}
                        </text>
                      </g>
                      {/* Segments fly out of the histogram bar or sankey
                          node they come from */}
                      {profile.segments.map((segment) => {
                        const rect = lerpRect(
                          (from === "bars" ? segmentsTo : segmentsFrom).get(
                            segment.sourceId
                          )!,
                          segment,
                          barsOpacity
                        );
                        return (
                          <rect
                            key={segment.priceComponent}
                            {...rect}
                            // A 1px gap separates the segments, a stroke would
                            // make the bar look thicker than its count bar
                            width={Math.max(0, rect.width - 1)}
                            fill={maybeMute(
                              profileShades[
                                BAR_COMPONENTS.indexOf(segment.priceComponent)
                              ]
                            )}
                          />
                        );
                      })}
                      <text
                        x={
                          (profile.segments.at(-1)?.x ?? 0) +
                          (profile.segments.at(-1)?.width ?? 0) +
                          4
                        }
                        y={profile.countBar.y + bars.barHeight / 2}
                        dy="0.35em"
                        opacity={barsOpacity}
                        fontSize={theme.labelFontSize}
                        fill={maybeMute(theme.labelColor)}
                      >
                        {formatValue(profile.total)}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        )}

        {barsOpacity > 0 && (
          <Box
            display="flex"
            flexWrap="wrap"
            columnGap={4}
            sx={{
              ...tightLegend,
              position: "absolute",
              top: 0,
              right: 0,
              pointerEvents: "none",
            }}
            style={{ left: bars.priceLeft, opacity: barsOpacity }}
          >
            {BAR_COMPONENTS.map((priceComponent, i) => (
              <LegendItem
                key={priceComponent}
                item={getLocalizedLabel({ id: priceComponent })}
                color={shades(palette.monochrome[500])[i]}
                symbol="square"
              />
            ))}
          </Box>
        )}

        {sankeyOpacity > 0 &&
          sankey.columns.map((column, i) => (
            <Box
              key={column.priceComponent}
              sx={{ position: "absolute", top: 0, pointerEvents: "none" }}
              // Changes every frame, sx would add a CSS class each time
              style={{
                left: column.x,
                width:
                  i < sankey.columns.length - 1
                    ? sankey.columns[i + 1].x - column.x - 16
                    : layout.width - column.x,
                opacity: sankeyOpacity,
              }}
            >
              {i > 0 && (
                <Typography
                  variant="body3"
                  fontWeight={700}
                  sx={{ position: "absolute", left: -14 }}
                >
                  {i === sankey.columns.length - 1 ? "=" : "+"}
                </Typography>
              )}
              <Typography variant="body3" fontWeight={700} lineHeight={1.2}>
                {getLocalizedLabel({ id: column.priceComponent })}
              </Typography>
            </Box>
          ))}

        {sankeyOpacity > 0 &&
          sankey.bands.map((band) => (
            <Box
              key={band.colorKey}
              sx={{ position: "absolute", pointerEvents: "none" }}
              // Changes every frame, sx would add a CSS class each time
              style={{
                left: sankey.columns[0]?.x ?? 0,
                top: band.labelY,
                opacity: sankeyOpacity,
              }}
            >
              <LegendItem
                item={colorLabels.get(band.colorKey) ?? band.colorKey}
                color={colors(band.colorKey)}
                symbol="square"
              />
            </Box>
          ))}

        {hovered && tooltipAnchor && (
          <HoverTooltip
            title={
              isProfile(hovered)
                ? colorLabels.get(hovered.colorKey) ?? hovered.colorKey
                : isBar(hovered)
                ? `${getLocalizedLabel({
                    id: hovered.priceComponent,
                  })}: ${formatBin(hovered.x0)}–${formatBin(
                    hovered.x1
                  )} ${i18n._(RP_PER_KWH)}`
                : `${getLocalizedLabel({
                    id: hovered.from.priceComponent,
                  })} ${formatValues(hovered.from)} → ${getLocalizedLabel({
                    id: hovered.to.priceComponent,
                  })} ${formatValues(hovered.to)}`
            }
            rows={
              isProfile(hovered)
                ? [
                    ...hovered.segments.map((segment) => ({
                      key: segment.priceComponent,
                      color: shades(colors(hovered.colorKey))[
                        BAR_COMPONENTS.indexOf(segment.priceComponent)
                      ],
                      label: getLocalizedLabel({
                        id: segment.priceComponent,
                      }),
                      value: formatValue(segment.value),
                      // The other components step back
                      muted:
                        !!hoveredComponent &&
                        segment.priceComponent !== hoveredComponent,
                    })),
                    {
                      key: "total",
                      label: getLocalizedLabel({ id: "total" }),
                      value: `${formatValue(hovered.total)} ${i18n._(
                        RP_PER_KWH
                      )}`,
                    },
                  ]
                : (isBar(hovered)
                    ? hovered.segments.map((s) => ({
                        colorKey: s.colorKey,
                        count: s.keys.length,
                      }))
                    : hovered.counts
                  )
                    .slice()
                    .sort(
                      (a, b) =>
                        colorDomain.indexOf(a.colorKey) -
                        colorDomain.indexOf(b.colorKey)
                    )
                    .map(({ colorKey, count }) => ({
                      key: colorKey,
                      color: colors(colorKey),
                      label: colorLabels.get(colorKey) ?? colorKey,
                      value: `${count} ${getLocalizedLabel({
                        id: "municipalities",
                      })}`,
                    }))
            }
            footer={
              isProfile(hovered)
                ? `${formatCount(hovered.keys.length)} ${
                    hovered.keys.length === 1 ? "has" : "have"
                  } this price profile`
                : undefined
            }
            anchor={tooltipAnchor}
            flip={tooltipAnchor.right > layout.width * 0.6}
          />
        )}
      </div>
    </div>
  );
};

const HoverTooltip = ({
  title,
  rows,
  footer,
  anchor,
  flip,
}: {
  title: string;
  /** Rows without a color are plain text, like a total */
  rows: {
    key: string;
    color?: string;
    label: string;
    value: string;
    muted?: boolean;
  }[];
  /** A sentence below the rows */
  footer?: string;
  anchor: { left: number; right: number; y: number };
  /** Shows the tooltip left of the anchor, near the right edge */
  flip: boolean;
}) => {
  return (
    <Box
      // Changes with every hovered bar, sx would add a CSS class each time
      style={{
        left: flip ? anchor.left - 8 : anchor.right + 8,
        top: anchor.y,
        transform: flip ? "translateX(-100%)" : undefined,
      }}
      sx={{
        position: "absolute",
        pointerEvents: "none",
        backgroundColor: "background.paper",
        boxShadow: 2,
        borderRadius: 1,
        px: 2,
        py: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      <Typography variant="body3" fontWeight={700}>
        {title}
      </Typography>
      {rows.map(({ key, color, label, value, muted }) => (
        <Box
          key={key}
          display="flex"
          alignItems="baseline"
          gap={2}
          // LegendItem has a top margin, plain rows get the same gap
          mt={color ? undefined : "0.5rem"}
          style={{ opacity: muted ? 0.45 : 1 }}
        >
          {color ? (
            <LegendItem item={label} color={color} symbol="square" />
          ) : (
            <Typography variant="body3" fontWeight={700}>
              {label}
            </Typography>
          )}
          <Typography variant="body3" ml="auto">
            {value}
          </Typography>
        </Box>
      ))}
      {footer && (
        <Typography
          variant="body3"
          color="text.secondary"
          display="block"
          textAlign="right"
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
};
