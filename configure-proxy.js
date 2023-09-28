const { setGlobalDispatcher, ProxyAgent } = require("undici");

const env = process.env;

if (env.HTTP_PROXY) {
  // Corporate proxy uses CA not in undici's certificate store
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const dispatcher = new ProxyAgent({
    uri: new URL(env.HTTP_PROXY).toString(),
  });
  setGlobalDispatcher(dispatcher);
}
