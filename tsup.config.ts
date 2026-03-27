import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      "metar-parser": "src/metar-parser.ts",
    },
    tsconfig: "tsconfig.build.json",
    format: ["esm"],
    dts: true,
    clean: true,
    outDir: "dist",
    target: "es2019",
    sourcemap: false,
    outExtension({ format }) {
      return {
        js: ".js",
      };
    },
  },
  {
    entry: {
      "metar-parser": "src/metar-parser.global.ts",
    },
    tsconfig: "tsconfig.build.json",
    format: ["iife"],
    dts: false,
    clean: false,
    outDir: "dist",
    target: "es2019",
    sourcemap: false,
    outExtension() {
      return {
        js: ".global.js",
      };
    },
  },
]);
