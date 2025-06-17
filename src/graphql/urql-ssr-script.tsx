import { ssr } from "src/graphql/urql-exchanges.server";

const UrqlSSRScript = () => {
  const extractedData = JSON.stringify(ssr.extractData());
  const html = `window.__URQL_DATA__ = ${extractedData};`;
  return (
    <script
      type="text/javascript"
      id="urql-ssr-script"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></script>
  );
};

export default UrqlSSRScript;
