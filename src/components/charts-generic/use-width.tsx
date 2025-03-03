import { createContext, ReactNode, useContext } from "react";

import { useResizeObserver } from "src/lib/use-resize-observer";

export type Margins = {
  annotations?: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Bounds = {
  width: number;
  height: number;
  margins: Margins;
  chartWidth: number;
  chartHeight: number;
};

const INITIAL_WIDTH = 1;

export const Observer = ({ children }: { children: ReactNode }) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();

  return (
    <div ref={resizeRef} aria-hidden="true">
      {width > 1 ? (
        <ChartObserverContext.Provider value={width}>
          {children}
        </ChartObserverContext.Provider>
      ) : null}
    </div>
  );
};

const ChartObserverContext = createContext(INITIAL_WIDTH);

export const useWidth = () => {
  const ctx = useContext(ChartObserverContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useWidth()"
    );
  }

  return ctx;
};
