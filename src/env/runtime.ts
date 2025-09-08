import { RuntimeEnv, runtimeSchema } from "src/env/schema";

export const scriptId = `__RUNTIME_ENV__`;

export const getRuntimeServerSideEnvVariables: () => StringOrUndefinedValues<RuntimeEnv> =
  () => ({
    PUBLIC_URL: process.env.VERCEL_URL || process.env.PUBLIC_URL,
    CURRENT_PERIOD: process.env.CURRENT_PERIOD,
    FIRST_PERIOD: process.env.FIRST_PERIOD,
    FLAGS: process.env.FLAGS,
  });

const getRuntimeClientSideVariables = () =>
  JSON.parse(document.getElementById(scriptId)?.textContent ?? "{}");

export const getClientRuntimeEnv = () =>
  typeof window === "undefined"
    ? runtimeSchema.parse(getRuntimeServerSideEnvVariables())
    : runtimeSchema.parse(getRuntimeClientSideVariables());

export const runtimeEnv = getClientRuntimeEnv()!;

type StringOrUndefinedValues<T> = {
  [K in keyof T]: string | undefined;
};
