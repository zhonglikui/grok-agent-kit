import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/bin.ts"
  },
  format: ["esm"],
  target: "node22",
  platform: "node",
  sourcemap: true,
  clean: true,
  bundle: true,
  splitting: false
});
