import { buildSchema } from "./schema";

// Should reference the same variables as in next.config.js
export default buildSchema.parse({
  DEPLOYMENT: process.env.DEPLOYMENT,
  CURRENT_PERIOD: process.env.CURRENT_PERIOD,
  FIRST_PERIOD: process.env.FIRST_PERIOD,
  VERSION: process.env.VERSION,
  ALLOW_ENGLISH: process.env.ALLOW_ENGLISH === "true",
  PUBLIC_URL: process.env.PUBLIC_URL,
});
