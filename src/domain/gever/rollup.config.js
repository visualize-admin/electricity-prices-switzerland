// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";
export default {
  input: "cli.ts",
  output: {
    dir: "output",
    format: "cjs",
  },
  plugins: [
    typescript(),
    string({
      include: "**/*.xml",
    }),
  ],
};
