import { GetServerSideProps } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import { getSessionConfigFlagsInfo } from "src/admin-auth/info";
import { contextFromGetServerSidePropsContext } from "src/graphql/server-context";
import { SunshineDataService } from "src/lib/sunshine-data-service";
import { defaultLocale } from "src/locales/config";
import { apolloServer } from "src/pages/api/graphql";
import {
  createExecuteGraphqlQuery,
  ExecuteGraphqlQuery,
} from "src/utils/execute-graphql-query";

type Props = Record<string, $IntentionalAny>;

type EnhancedGSSP<
  P extends Props,
  PageParams extends Record<string, string>
> = (
  context: Parameters<GetServerSideProps<P, PageParams>>[0],
  options: {
    sparqlClient: ParsingClient;
    sunshineDataService: SunshineDataService;
    sessionConfig: Awaited<ReturnType<typeof getSessionConfigFlagsInfo>>;
    executeGraphqlQuery: ExecuteGraphqlQuery;
  }
) => ReturnType<GetServerSideProps<P, { locale: string }>>;

/**
 * Should be used to automatically add locale to the props of the page.
 * Also provides sparqlClient, sunshineDataService, sessionConfig,
 * and executeGraphqlQuery as second argument to the gssp function.
 */
const createGetServerSideProps = <
  P extends Props,
  PageParams extends Record<string, string>
>(
  gssp: EnhancedGSSP<P, PageParams>
): GetServerSideProps<P, PageParams> => {
  return async (context) => {
    const locale = context.params?.locale ?? defaultLocale;
    const graphqlContext = await contextFromGetServerSidePropsContext(context);
    const sessionConfig = await getSessionConfigFlagsInfo(context);

    const executeGraphqlQuery =
      createExecuteGraphqlQuery(apolloServer)(graphqlContext);

    const child = await gssp(context, {
      sparqlClient: graphqlContext.sparqlClient,
      sunshineDataService: graphqlContext.sunshineDataService,
      sessionConfig,
      executeGraphqlQuery,
    });
    if ("redirect" in child) {
      return child;
    }
    if ("notFound" in child) {
      return child;
    }
    return {
      props: {
        ...child.props,
        locale,
      },
    };
  };
};

export default createGetServerSideProps;
