import { ServerResponse, IncomingMessage } from "http";

import { Entity } from "src/domain/data";
import { defaultLocale } from "src/locales/config";
import {
  getMunicipality,
  getObservationsCube,
  getDimensionValuesAndLabels,
  getOperator,
  getOperatorMunicipalities,
  getCanton,
} from "src/rdf/queries";

export type PageParams = { locale: string; id: string; entity: Entity };

export type Props =
  | {
      entity: "canton";
      status: "found";
      id: string;
      name: string;
    }
  | {
      entity: "municipality";
      status: "found";
      id: string;
      name: string;
      operators: { id: string; name: string }[];
      locale: string;
    }
  | {
      entity: "operator";
      status: "found";
      id: string;
      name: string;
      municipalities: { id: string; name: string }[];
    }
  | {
      status: "notfound";
    };

export const handleMunicipalityEntity = async (
  params: Omit<PageParams, "entity"> & { res: ServerResponse<IncomingMessage> }
): Promise<
  Extract<Props, { entity: "municipality" } | { status: "notfound" }>
> => {
  const { id, locale, res } = params!;
  const municipality = await getMunicipality({ id });

  if (!municipality) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  const cube = await getObservationsCube();

  const operators = await getDimensionValuesAndLabels({
    cube,
    dimensionKey: "operator",
    filters: { municipality: [id] },
  });

  return {
    entity: "municipality",
    status: "found",
    id,
    name: municipality.name,
    operators: operators
      .sort((a, b) => a.name.localeCompare(b.name, locale))
      .map(({ id, name }) => ({ id, name })),
    locale: locale ?? defaultLocale,
  };
};
export const handleOperatorsEntity = async (
  params: Omit<PageParams, "entity"> & { res: ServerResponse<IncomingMessage> }
): Promise<Extract<Props, { entity: "operator" } | { status: "notfound" }>> => {
  const { id, locale, res } = params!;
  const operator = await getOperator({ id });

  if (!operator) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  const municipalities = await getOperatorMunicipalities(id, locale);

  return {
    entity: "operator",
    status: "found",
    id,
    name: operator.name,
    municipalities: municipalities,
  };
};

export const handleCantonEntity = async (
  params: Omit<PageParams, "entity"> & { res: ServerResponse<IncomingMessage> }
): Promise<Extract<Props, { entity: "canton" } | { status: "notfound" }>> => {
  const { id, locale, res } = params!;
  const canton = await getCanton({ id, locale: locale! });

  if (!canton) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  return { status: "found", id, name: canton.name, entity: "canton" };
};
