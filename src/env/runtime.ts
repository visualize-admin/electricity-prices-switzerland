import { RuntimeEnv, runtimeSchema } from "src/env/schema";

export const globalVariableName = `__RUNTIME_ENV__`;

export const getRuntimeServerSideEnvVariables: () => PartialUndefined<RuntimeEnv> =
  () => ({
    PUBLIC_URL: process.env.VERCEL_URL || process.env.PUBLIC_URL,
    CURRENT_PERIOD: process.env.CURRENT_PERIOD,
    FIRST_PERIOD: process.env.FIRST_PERIOD,
  });

export const getRuntimeClientSideVariables = () =>
  window[globalVariableName as keyof typeof window];

export const getClientRuntimeEnv = () =>
  typeof window === "undefined"
    ? runtimeSchema.parse(getRuntimeServerSideEnvVariables())
    : runtimeSchema.parse(getRuntimeClientSideVariables());

export const runtimeEnv = getClientRuntimeEnv()!;

type PartialUndefined<T> = {
  [K in keyof T]: T[K] | undefined;
};
