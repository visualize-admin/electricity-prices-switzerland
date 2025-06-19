import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { Entity } from "src/domain/data";

type MapContextType = {
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  entity: Entity;
  setEntity: Dispatch<SetStateAction<Entity>>;
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
  const [entity, setEntity] = useState<Entity>("municipality");

  return (
    <MapContext.Provider
      value={{ activeId, setActiveId, entity: entity, setEntity: setEntity }}
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
