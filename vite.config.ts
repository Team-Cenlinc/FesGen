import { copyFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import packageJson from "./package.json" with { type: "json" };

// GitHub Pages 目前部署在 /FesGen/ 子路径下；之后换成自定义域名时只需设置 FESGEN_BASE=/。
const productionBase = process.env.FESGEN_BASE ?? "/FesGen/";

export default defineConfig(({ command, isPreview }) => ({
  // 本地 vite preview 也用生产路径，才能检查构建产物在子路径下是否正常。
  base: command === "build" || isPreview ? productionBase : "/",
  plugins: [
    vue(),
    {
      // GitHub Pages 找不到 /FesGen/sign/… 这类路径时返回 404.html；让它就是应用本身，路由接手。
      name: "fesgen-spa-fallback",
      apply: "build",
      async writeBundle(options) {
        const dir = options.dir ?? "dist";
        await copyFile(`${dir}/index.html`, `${dir}/404.html`);
      },
    },
  ],
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
