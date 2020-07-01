import React, {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from "react";
import { Observation } from "../../domain/data";

export interface AnnotationElement {
  visible: boolean;
  mouse?: { x: number; y: number } | undefined;
  d: Observation | undefined;
}

interface AnnotationState {
  d: Observation[] | undefined;
}

type AnnotationStateAction = {
  type: "ADD_ANNOTATION";
  value: AnnotationState;
};

const ANNOTATION_INITIAL_STATE: AnnotationState = {
  d: undefined,
};

// Reducer
const AnnotationStateReducer = (
  state: AnnotationState,
  action: AnnotationStateAction
) => {
  switch (action.type) {
    case "ADD_ANNOTATION":
      return {
        d: state.d.concat(action.value.d),
      };

    default:
      throw new Error();
  }
};

// Provider
const AnnotationStateContext = createContext<
  [AnnotationState, Dispatch<AnnotationStateAction>] | undefined
>(undefined);

export const useAnnotation = () => {
  const ctx = useContext(AnnotationStateContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <AnnotationProvider /> to useAnnotation()"
    );
  }
  return ctx;
};

// Component
export const AnnotationProvider = ({
  d,
  children,
}: {
  d: Observation[] | undefined;
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer<
    Reducer<AnnotationState, AnnotationStateAction>
  >(AnnotationStateReducer, { d });

  return (
    <AnnotationStateContext.Provider value={[state, dispatch]}>
      {children}
    </AnnotationStateContext.Provider>
  );
};
