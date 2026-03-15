import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@grok-agent-kit/core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url)
      ),
      "@grok-agent-kit/mcp-server": fileURLToPath(
        new URL("./packages/mcp-server/src/index.ts", import.meta.url)
      ),
      "@grok-agent-kit/xai-client": fileURLToPath(
        new URL("./packages/xai-client/src/index.ts", import.meta.url)
      )
    }
  },
  test: {
    environment: "node",
    globals: true,
    include: [
      "apps/**/test/**/*.test.ts",
      "packages/**/test/**/*.test.ts"
    ]
  }
});
