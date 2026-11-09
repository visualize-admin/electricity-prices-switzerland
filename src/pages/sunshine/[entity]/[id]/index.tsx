import { GetServerSideProps } from "next";

/**
 * Sunshine always exposes a details page per indicator. Redirect the bare
 * entity URL (e.g. /sunshine/operator/30) to the overview so links and
 * bookmarks that omit the indicator still land on a usable page.
 */
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const entity = params?.entity;
  const id = params?.id;

  if (entity !== "operator" || typeof id !== "string") {
    return { notFound: true };
  }

  return {
    redirect: {
      destination: `/sunshine/${entity}/${id}/overview`,
      permanent: false,
    },
  };
};

const SunshineOperatorRedirect = () => null;

export default SunshineOperatorRedirect;
