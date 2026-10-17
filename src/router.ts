import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "./pages/HomePage.vue";

// 用 hash 路由：GitHub Pages 没有 SPA 回退，换域名或子路径时也不用改服务器配置。
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "library", component: HomePage },
    { path: "/map-art", name: "map-art", component: () => import("./pages/MapArtPage.vue") },
  ],
});
