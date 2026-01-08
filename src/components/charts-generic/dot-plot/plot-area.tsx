import {
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

const PlotArea = ({ children }: { children: React.ReactNode }) => {
  const { bounds } = useChartState() as DotPlotState;
  return (
    <g transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}>
      {children}
    </g>
  );
};

export default PlotArea;
