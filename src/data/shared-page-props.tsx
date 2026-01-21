import { GetServerSidePropsContext } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import { Entity } from "src/domain/data";
import { defaultLocale } from "src/locales/config";
import {
  getCanton,
  getMunicipality,
  getMunicipalityOperators,
  getOperator,
  getOperatorMunicipalities,
} from "src/rdf/queries";
import { SessionConfigFlagInfo } from "src/admin-auth/info";

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
  client: ParsingClient,
  params: Omit<PageParams, "entity"> &
    Pick<GetServerSidePropsContext, "res"> & {
      years: string[];
    }
): Promise<
  Extract<Props, { entity: "municipality" } | { status: "notfound" }>
> => {
  const { id, locale, res, years } = params!;
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
  client: ParsingClient,
  params: Omit<PageParams, "entity"> & Pick<GetServerSidePropsContext, "res">
): Promise<Extract<Props, { entity: "operator" } | { status: "notfound" }>> => {
  const { id, locale, res } = params!;

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
  client: ParsingClient,
  params: Omit<PageParams, "entity"> & Pick<GetServerSidePropsContext, "res">
): Promise<Extract<Props, { entity: "canton" } | { status: "notfound" }>> => {
  const { id, locale, res } = params!;

  const canton = await getCanton({ id, locale: locale!, client });

  if (!canton) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  return { status: "found", id, name: canton.name, entity: "canton" };
};
