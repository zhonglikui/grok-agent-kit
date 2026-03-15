import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/bin.ts"
  },
  format: ["esm"],
  target: "node20",
  platform: "node",
  sourcemap: true,
  clean: true,
  bundle: true,
  splitting: false
});
