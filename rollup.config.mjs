import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const sdPlugin = "com.memetcircus.musedeck.sdPlugin";

/**
 * Bundles the MuseDeck plugin into com.memetcircus.musedeck.sdPlugin/bin/plugin.js
 * declared in manifest.json CodePath.
 */
export default {
  input: "src/plugin/src/plugin.ts",
  output: {
    file: `${sdPlugin}/bin/plugin.js`,
    sourcemap: true,
    format: "esm",
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      outDir: `${sdPlugin}/bin`,
      declaration: false,
      declarationMap: false,
      sourceMap: true,
    }),
    nodeResolve({ browser: false, exportConditions: ["node"], preferBuiltins: true }),
    commonjs(),
  ],
  external: [
    "node:fs",
    "node:os",
    "node:path",
    "node:http",
    "node:https",
    "node:child_process",
    "node:url",
    "node:buffer",
    "node:events",
    "typescript",
  ],
};
