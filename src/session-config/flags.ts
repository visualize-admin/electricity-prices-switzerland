import { z } from "zod";

import { sessionConfigFlagsSchema } from "./schema";

const getFlagOptions = (
  key: keyof z.infer<typeof sessionConfigFlagsSchema>
) => {
  const schema = sessionConfigFlagsSchema.shape[key];
  if (
    schema instanceof z.ZodDefault &&
    schema._def.innerType instanceof z.ZodEnum
  ) {
    return schema._def.innerType._def.values.map((value) => ({
      value,
    }));
  }
  return [];
};

const getFlagType = (key: keyof z.infer<typeof sessionConfigFlagsSchema>) => {
  const schema = sessionConfigFlagsSchema.shape[key];
  if (schema instanceof z.ZodDefault) {
    if (schema._def.innerType instanceof z.ZodEnum) {
      return "enum";
    }
  }
  return "string";
};

export const getFlagInfo = (
  key: keyof z.infer<typeof sessionConfigFlagsSchema>
) => {
  const schema = sessionConfigFlagsSchema.shape[key];
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
