import { useState, useEffect } from "react";

export type FetchDataState<T> =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | {
      state: "loaded";
      data: T;
    };

export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
): FetchDataState<T> => {
  const [state, setState] = useState<FetchDataState<T>>({ state: "fetching" });

  useEffect(() => {
    const load = async () => {
      setState({ state: "fetching" });
      try {
        const data = await fetchFn();
        setState({
          state: "loaded",
          data,
        });
      } catch {
        setState({ state: "error" });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
};
