import { z } from "zod";

import { sessionConfigFlagsSchema } from "./schema";

type FlagKey = keyof z.infer<typeof sessionConfigFlagsSchema>;

const getInnerSchema = (key: FlagKey): unknown => {
  const schema = sessionConfigFlagsSchema.shape[key] as unknown;
  return schema instanceof z.ZodDefault ? schema.def.innerType : schema;
};

const getFlagOptions = (key: FlagKey) => {
  const inner = getInnerSchema(key);
  return inner instanceof z.ZodEnum
    ? inner.options.map((value) => ({ value: String(value) }))
    : [];
};

const getFlagType = (key: FlagKey) =>
  getInnerSchema(key) instanceof z.ZodEnum ? "enum" : "string";

export const getFlagInfo = (key: FlagKey) => {
  const schema: z.ZodType = sessionConfigFlagsSchema.shape[key];
  const type = getFlagType(key);
  const options = getFlagOptions(key);
  const description =
    schema.description || "No description available for this flag.";
  return { type, options, description };
};

/**
 * TypeScript type representing the session-config flags configuration.
 */
export type SessionConfigFlags = z.infer<typeof sessionConfigFlagsSchema>;

/**
 * Default values for all session-config flags.
 * This provides a fallback configuration when no flags are set.
 */
export const defaultSessionConfigFlags: SessionConfigFlags =
  sessionConfigFlagsSchema.parse({});

export const getDefaultedFlags = (
  partialFlags: Partial<SessionConfigFlags> | undefined
): SessionConfigFlags => {
  return {
    ...defaultSessionConfigFlags,
    ...partialFlags,
  };
};
