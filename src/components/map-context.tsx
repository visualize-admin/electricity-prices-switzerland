import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type ListState = "MUNICIPALITIES" | "OPERATORS" | "CANTONS";

type MapContextType = {
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  listState: ListState;
  setListState: Dispatch<SetStateAction<ListState>>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

type MapProviderProps = {
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  children: ReactNode;
};

export const MapProvider = ({
  activeId,
  setActiveId,
  children,
}: MapProviderProps) => {
  const [listState, setListState] = useState<ListState>("MUNICIPALITIES");

  return (
    <MapContext.Provider
      value={{ activeId, setActiveId, listState, setListState }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a MapProvider");
  return context;
};
