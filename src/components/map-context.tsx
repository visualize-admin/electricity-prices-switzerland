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
import { assertBaseDomainOK } from "src/utils/domain";
import { useFlag } from "src/utils/flags";
import { shouldOpenInNewTab } from "src/utils/platform";

type MapContextType = {
  activeId: string | null;
  setActiveId: (activeId: string | null) => void;
  entity: Entity;
  setEntity: Dispatch<SetStateAction<Entity>>;
  onEntitySelect: (
    event: Event | MouseEvent,
    entity: Entity,
    id: string
  ) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

type MapProviderProps = {
  activeId: string | null;
  setActiveId: (activeId: string | null) => void;
  children: ReactNode;
  embed?: boolean;
};

const useEmbedEntityClick = () => {
  const router = useRouter();

  const baseDomain = useMemo(() => {
    const url = new URL(
      typeof window !== "undefined"
        ? window.location.href
        : "https://strompreis.elcom.admin.ch"
    );
    const urlDomain = `${url?.protocol}//${url?.hostname}${
      url?.port !== "80" ? `:${url?.port}` : ""
    }`;
    return router.query.baseDomain || urlDomain;
  }, [router.query]);

  const target =
    router.query.target && typeof router.query.target === "string"
      ? router.query.target
      : "_blank";

  assertBaseDomainOK(baseDomain as string);

  return useEvent((entity: Entity, id: string) => {
    window.open(`${baseDomain}/${entity}/${id}`, target);
  });
};

export const MapProvider = ({
  activeId,
  setActiveId,
  children,
  embed,
}: MapProviderProps) => {
  const [entity, setEntity] = useState<Entity>("municipality");
  const isSunshine = useFlag("sunshine");
  const router = useRouter();

  const embedEntityClick = useEmbedEntityClick();

  const onEntitySelect: MapContextType["onEntitySelect"] = useEvent(
    (ev, entity: Entity, id: string) => {
      if (embed) {
        return embedEntityClick(entity, id);
      } else {
        if (isSunshine) {
          setActiveId(id);
        } else {
          if (shouldOpenInNewTab(ev)) {
            // Open in new tab if meta key is pressed
            window.open(`/${entity}/${id}`, "_blank");
            return;
          } else {
            router.push(`/${entity}/${id}`);
          }
        }
      }
    }
  );

  const value = useMemo(
    () => ({
      activeId,
      setActiveId,
      entity,
      setEntity,
      onEntitySelect,
    }),
    [activeId, setActiveId, entity, setEntity, onEntitySelect]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a MapProvider");
  return context;
};
