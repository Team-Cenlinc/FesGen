# FesGen

A sign generator.

![GitHub deployments](https://img.shields.io/github/deployments/Team-Cenlinc/FesGen/github-pages?label=Environment%20Deployment&logo=Github&style=for-the-badge)

![Discord](https://img.shields.io/discord/612247443752353803?style=for-the-badge&logo=discord)

![Lines of code](https://img.shields.io/tokei/lines/github/Team-Cenlinc/FesGen?style=for-the-badge)

![Twitter Follow](https://img.shields.io/twitter/follow/Fetarute?color=%234abdaa&logo=twitter&style=for-the-badge)

### Dev Info

![Alt](https://repobeats.axiom.co/api/embed/d76d2cf64fc35847b639cb8a63f91d5e57f926f3.svg "Repobeats analytics image")

### For Dev

需要 Node 24 和 npm 11（见 `.nvmrc`）。

```
# 安装依赖
npm install

# 本地开发，默认 http://localhost:5173
npm run dev

# 格式、类型、单元测试、生产构建一次跑完（CI 同款）
npm run check

# 生产构建；默认部署在 /FesGen/ 子路径，换自定义域名时设置 FESGEN_BASE=/
npm run build
```

- 技术栈：Vue 3 + Vite + TypeScript + Pinia
- 地图画核心代码在 `src/mapart/`：Java 版 1.21 地图色板、CIELAB 取色（与 FetaruteTCAddon 站台屏一致）、量化与抖动、格子与适配

### About Fetarute

Twitter:[@Fetarute](https://twitter.com/fetarute)
