import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react";

import { GenericObservation } from "src/domain/data";

type InteractionState = {
  interaction: {
    visible: boolean;
    mouse?: { x: number; y: number } | undefined;
    d: GenericObservation | undefined;
    // Optional interaction id to distinguish multiple interactions
    // from the same context
    id?: string;
  };
};

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

const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
  switch (action.type) {
    case "INTERACTION_UPDATE":
      return {
        ...state,
        interaction: {
          ...action.value.interaction,
          mouse: action.value.interaction.mouse
            ? {
                ...action.value.interaction.mouse,
              }
            : undefined,
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
