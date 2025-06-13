import { ProxyAgent, setGlobalDispatcher } from "undici";

declare global {
  // eslint-disable-next-line no-var
  var __undiciProxyAgent__: ProxyAgent | undefined;
}

export const setupUndiciHttpAgent = () => {
  const HTTP_PROXY = process.env.HTTP_PROXY;
  if (!HTTP_PROXY) {
    return;
  }
  if (!globalThis.__undiciProxyAgent__) {
    console.info("Setting up undici proxy agent: ", HTTP_PROXY);
    globalThis.__undiciProxyAgent__ = new ProxyAgent(HTTP_PROXY);
    setGlobalDispatcher(globalThis.__undiciProxyAgent__);
  }
};
