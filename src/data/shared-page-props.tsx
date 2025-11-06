import { GetServerSidePropsContext } from "next";

import { Entity } from "src/domain/data";
import { defaultLocale } from "src/locales/config";
import {
  getCanton,
  getMunicipality,
  getMunicipalityOperators,
  getOperator,
  getOperatorMunicipalities,
} from "src/rdf/queries";
import { getSparqlClientFromRequest } from "src/rdf/sparql-client";
import { SessionConfigFlagInfo } from "src/session-config/info";

export type PageParams = {
  locale: string;
  id: string;
  entity: Entity;
};

export type SessionConfigDebugProps = {
  flags: Record<string, SessionConfigFlagInfo>;
};

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

export const getMunicipalityPageProps = async (
  params: Omit<PageParams, "entity"> &
    Pick<GetServerSidePropsContext, "res" | "req"> & {
      years: string[];
    }
): Promise<
  Extract<Props, { entity: "municipality" } | { status: "notfound" }>
> => {
  const { id, locale, res, years } = params!;
  const client = await getSparqlClientFromRequest(params.req);
  const municipality = await getMunicipality({ id, client });

  if (!municipality) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  const operators = await getMunicipalityOperators(client, id, years);

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
export const getOperatorsPageProps = async (
  params: Omit<PageParams, "entity"> &
    Pick<GetServerSidePropsContext, "res" | "req">
): Promise<Extract<Props, { entity: "operator" } | { status: "notfound" }>> => {
  const { id, locale, res } = params!;
  const client = await getSparqlClientFromRequest(params.req);

  const operator = await getOperator({ id, client });

  if (!operator) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  const municipalities = await getOperatorMunicipalities(id, locale, client);

  return {
    entity: "operator",
    status: "found",
    id,
    name: operator.name,
    municipalities: municipalities,
  };
};

export const getCantonPageProps = async (
  params: Omit<PageParams, "entity"> &
    Pick<GetServerSidePropsContext, "res" | "req">
): Promise<Extract<Props, { entity: "canton" } | { status: "notfound" }>> => {
  const { id, locale, res } = params!;
  const client = await getSparqlClientFromRequest(params.req);

  const canton = await getCanton({ id, locale: locale!, client });

  if (!canton) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  return { status: "found", id, name: canton.name, entity: "canton" };
};
