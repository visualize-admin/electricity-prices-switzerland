import { GetServerSideProps } from "next";
import { Client } from "urql";

import {
  contextFromGetServerSidePropsContext,
  GraphqlRequestContext,
} from "src/graphql/server-context";
import { makeExchanges } from "src/graphql/urql-exchanges.server";
import { defaultLocale } from "src/locales/config";

type Props = Record<string, $IntentionalAny>;

type EnhancedGSSP<
  P extends Props,
  PageParams extends Record<string, string>
> = (
  context: Parameters<GetServerSideProps<P, PageParams>>[0],
  options: {
    urqlClient: Client;
    graphqlContext: GraphqlRequestContext;
  }
) => ReturnType<GetServerSideProps<P, { locale: string }>>;

/**
 * Should be used to automatically add locale to the props of the page.
 * Also provides urqlClient as second argument to the gssp function.
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
    const urqlClient = new Client({
      exchanges: makeExchanges(graphqlContext),

      // Does not matter as we are using the executeExchange
      url: "does-not-matter",
    });
    const child = await gssp(context, {
      urqlClient,
      graphqlContext,
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
