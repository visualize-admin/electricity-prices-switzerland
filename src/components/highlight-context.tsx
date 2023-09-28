import { createContext, Dispatch, SetStateAction } from "react";

import { Entity } from "../domain/data";

export type HighlightValue = {
  entity: Entity;
  id: string;
  label: string;
  value: number;
};

export const HighlightContext = createContext({
  value: undefined as HighlightValue | undefined,
  setValue: (() => undefined) as Dispatch<
    SetStateAction<HighlightValue | undefined>
  >,
});
