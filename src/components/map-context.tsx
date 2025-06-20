import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

import { Entity } from "src/domain/data";
import useEvent from "src/lib/use-event";
import { useFlag } from "src/utils/flags";

type MapContextType = {
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  entity: Entity;
  setEntity: Dispatch<SetStateAction<Entity>>;
  onListItemSelect: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => void;
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
  const isSunshine = useFlag("sunshine");
  const router = useRouter();

  const onListItemSelect: MapContextType["onListItemSelect"] = useEvent(
    (_, id: string) => {
      if (isSunshine) {
        setActiveId(id);
      } else {
        router.push(`/${entity}/${id}`);
      }
    }
  );

  const value = useMemo(
    () => ({
      activeId,
      setActiveId,
      entity,
      setEntity,
      onListItemSelect,
    }),
    [activeId, setActiveId, entity, setEntity, onListItemSelect]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a MapProvider");
  return context;
};
