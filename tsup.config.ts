import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "metar-parser": "src/metar-parser.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  outDir: "dist",
  target: "es2019",
  sourcemap: false,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
