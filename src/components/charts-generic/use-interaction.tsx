import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react";

import { GenericObservation } from "../../domain/data";

export interface InteractionElement {
  visible: boolean;
  mouse?: { x: number; y: number } | undefined;
  d: GenericObservation | undefined;
}

interface InteractionState {
  interaction: InteractionElement;
}

type InteractionStateAction =
  | {
      type: "INTERACTION_UPDATE";
      value: Pick<InteractionState, "interaction">;
    }
  | {
      type: "INTERACTION_HIDE";
    };

const INTERACTION_INITIAL_STATE: InteractionState = {
  interaction: {
    visible: false,
    mouse: undefined,
    d: undefined,
  },
};

// Reducer
const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
  switch (action.type) {
    case "INTERACTION_UPDATE":
      return {
        ...state,
        interaction: {
          visible: action.value.interaction.visible,
          mouse: action.value.interaction.mouse
            ? {
                x: action.value.interaction.mouse.x,
                y: action.value.interaction.mouse.y,
              }
            : undefined,
          d: action.value.interaction.d,
        },
      };
    case "INTERACTION_HIDE":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visible: false,
          mouse: undefined,
          d: undefined,
        },
      };

    default:
      throw new Error();
  }
};

// Provider
const InteractionStateContext = createContext<
  [InteractionState, Dispatch<InteractionStateAction>] | undefined
>(undefined);

export const useInteraction = () => {
  const ctx = useContext(InteractionStateContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <InteractionProvider /> to useInteraction()"
    );
  }
  return ctx;
};

// Component
export const InteractionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    InteractionStateReducer,
    INTERACTION_INITIAL_STATE
  );

  return (
    <InteractionStateContext.Provider value={[state, dispatch]}>
      {children}
    </InteractionStateContext.Provider>
  );
};
