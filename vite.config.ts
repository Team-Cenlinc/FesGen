import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import packageJson from "./package.json" with { type: "json" };

// GitHub Pages 目前部署在 /FesGen/ 子路径下；之后换成自定义域名时只需设置 FESGEN_BASE=/。
const productionBase = process.env.FESGEN_BASE ?? "/FesGen/";

export default defineConfig(({ command, isPreview }) => ({
  // 本地 vite preview 也用生产路径，才能检查构建产物在子路径下是否正常。
  base: command === "build" || isPreview ? productionBase : "/",
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
}));
