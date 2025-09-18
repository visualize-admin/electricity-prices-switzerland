import { buildSchema } from "./schema";

// Should reference the same variables as in next.config.js

// jsdoc comment to export
/** @type {import("./schema").BuildEnv} */
export default buildSchema.parse({
  VERSION: process.env.VERSION,
  ALLOW_ENGLISH: process.env.ALLOW_ENGLISH === "true",
});
